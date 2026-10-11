import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as crypto from 'crypto';
import { AddressInfo } from 'net';
import { app } from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { generateAccessToken } from '../../common/utils/token.util.js';
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '../../common/utils/payment.util.js';
import { paymentService } from './payment.service.js';
import { uuidv7 } from '../../common/utils/id.util.js';
import { PaymentStatus, RoleType, ApplicationStatus } from '@prisma/client';

describe('Razorpay Payment Module', () => {
  let server: any;
  let baseUrl: string;
  let testUser: any;
  let testUserToken: string;
  let testOrg: any;

  const testSecret = 'rzp_test_secret_super_secure_key_123';
  const testKeyId = 'rzp_test_custom_key_id_999';

  before(async () => {
    // Set test Razorpay credentials for integration testing
    process.env.RAZORPAY_KEY_ID = testKeyId;
    process.env.RAZORPAY_KEY_SECRET = testSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;
    ENV.RAZORPAY_KEY_ID = testKeyId;
    ENV.RAZORPAY_KEY_SECRET = testSecret;
    ENV.RAZORPAY_WEBHOOK_SECRET = testSecret;

    // Start server on an ephemeral port
    server = app.listen(0);
    const port = (server.address() as AddressInfo).port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Create unique test user in database
    const userSuffix = Date.now().toString().slice(-6);
    testUser = await prisma.user.create({
      data: {
        id: uuidv7(),
        username: `test_pay_student_${userSuffix}`,
        email: `pay_student_${userSuffix}@testcampus.edu`,
        fullName: `Payment Test Student ${userSuffix}`,
      },
    });

    // Create unique test organization in database
    testOrg = await prisma.organization.create({
      data: {
        id: uuidv7(),
        name: `Test Payment Club ${userSuffix}`,
        slug: `test-pay-club-${userSuffix}`,
        membershipFee: 50000, // ₹500 in paise
        isActive: true,
      },
    });

    // Generate JWT access token for test user
    testUserToken = generateAccessToken({
      userId: testUser.id,
      username: testUser.username,
      email: testUser.email,
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
    });
  });

  after(async () => {
    if (server) {
      server.close();
    }

    // Clean up test records
    try {
      if (testUser?.id) {
        await prisma.payment.deleteMany({ where: { userId: testUser.id } });
        await prisma.userRole.deleteMany({ where: { userId: testUser.id } });
        await prisma.membershipApplication.deleteMany({ where: { userId: testUser.id } });
        await prisma.notification.deleteMany({ where: { userId: testUser.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
      }
      if (testOrg?.id) {
        await prisma.organization.delete({ where: { id: testOrg.id } });
      }
    } catch (cleanupErr) {
      console.warn('Test cleanup notice:', cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  });

  // =========================================================================
  // 1. Cryptographic HMAC SHA-256 Signatures
  // =========================================================================
  describe('Cryptographic Signature Verification Utility', () => {
    const orderId = 'order_test_98765';
    const paymentId = 'pay_test_54321';

    const generateSignature = (payload: string, secret: string) => {
      return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    };

    it('returns true for genuine payment signature', () => {
      const validSig = generateSignature(`${orderId}|${paymentId}`, testSecret);
      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSig,
        secret: testSecret,
      });
      assert.strictEqual(isValid, true);
    });

    it('returns false for tampered payment signature', () => {
      const validSig = generateSignature(`${orderId}|${paymentId}`, testSecret);
      const tamperedSig = validSig.slice(0, -4) + '0000';
      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: tamperedSig,
        secret: testSecret,
      });
      assert.strictEqual(isValid, false);
    });

    it('returns false when parameters are missing or secret is wrong', () => {
      const validSig = generateSignature(`${orderId}|${paymentId}`, testSecret);
      assert.strictEqual(
        verifyRazorpayPaymentSignature({ orderId: '', paymentId, signature: validSig, secret: testSecret }),
        false
      );
      assert.strictEqual(
        verifyRazorpayPaymentSignature({ orderId, paymentId: '', signature: validSig, secret: testSecret }),
        false
      );
      assert.strictEqual(
        verifyRazorpayPaymentSignature({ orderId, paymentId, signature: validSig, secret: 'wrong_secret' }),
        false
      );
    });

    it('verifies genuine webhook payload and detects tampered webhook payload', () => {
      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: paymentId, order_id: orderId } } },
      });
      const validWebhookSig = generateSignature(webhookPayload, testSecret);

      const isValid = verifyRazorpayWebhookSignature({
        payload: webhookPayload,
        signature: validWebhookSig,
        secret: testSecret,
      });
      assert.strictEqual(isValid, true);

      // Tampered payload
      const tamperedPayload = JSON.stringify({ event: 'payment.failed' });
      const isTamperedValid = verifyRazorpayWebhookSignature({
        payload: tamperedPayload,
        signature: validWebhookSig,
        secret: testSecret,
      });
      assert.strictEqual(isTamperedValid, false);
    });
  });

  // =========================================================================
  // 2. Authentication and Authorization on /create-order
  // =========================================================================
  describe('POST /api/payment/create-order - Authentication', () => {
    it('returns 401 when no authorization header is provided', async () => {
      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: testOrg.id }),
      });

      assert.strictEqual(res.status, 401);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.message, /Authentication required/i);
    });

    it('returns 401 when an invalid bearer token is provided', async () => {
      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid.token.payload',
        },
        body: JSON.stringify({ organizationId: testOrg.id }),
      });

      assert.strictEqual(res.status, 401);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
    });
  });

  // =========================================================================
  // 3. Validation on /create-order
  // =========================================================================
  describe('POST /api/payment/create-order - Input Validation', () => {
    it('returns 400 when neither organizationId nor bookingId is provided', async () => {
      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.strictEqual(res.status, 400);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.message, /organizationId or bookingId is required/i);
    });

    it('returns 404 when organizationId does not exist in the database', async () => {
      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ organizationId: 'non-existent-org-uuid-000' }),
      });

      assert.strictEqual(res.status, 404);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.message, /not found/i);
    });
  });

  // =========================================================================
  // 4. Successful Order Creation & Amount Tamper Protection
  // =========================================================================
  describe('POST /api/payment/create-order - Database Integrity & Success', () => {
    let createdOrderId: string;

    it('ignores client-supplied amount and fetches the actual membership fee from Prisma', async () => {
      // Mock Razorpay SDK orders.create on paymentService for deterministic integration test
      const originalGetRazorpay = (paymentService as any).getRazorpayInstance;
      (paymentService as any).getRazorpayInstance = () => ({
        orders: {
          create: async (params: any) => {
            return {
              id: `order_mock_${Date.now()}`,
              amount: params.amount,
              currency: params.currency || 'INR',
              receipt: params.receipt,
              status: 'created',
            };
          },
        },
      });

      try {
        // Frontend attempts to pay ₹0.01 (100 paise) instead of ₹500 (50000 paise)
        const res = await fetch(`${baseUrl}/api/payment/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testUserToken}`,
          },
          body: JSON.stringify({
            organizationId: testOrg.id,
            amount: 100, // malicious client tamper attempt
          }),
        });

        assert.strictEqual(res.status, 201);
        const json: any = await res.json();

        assert.strictEqual(json.success, true);
        assert.ok(json.orderId);
        assert.strictEqual(json.id, json.orderId);
        // Canonical amount from DB must be 50000 paise, NOT 100
        assert.strictEqual(json.amount, 50000);
        assert.strictEqual(json.currency, 'INR');
        assert.strictEqual(json.keyId, testKeyId);
        // Verify Razorpay Key Secret is NEVER returned
        assert.strictEqual((json as any).keySecret, undefined);
        assert.strictEqual((json as any).secret, undefined);

        createdOrderId = json.orderId;

        // Verify Prisma Payment record persisted in DB
        const dbPayment = await prisma.payment.findFirst({
          where: { razorpayOrderId: json.orderId },
        });

        assert.ok(dbPayment);
        assert.strictEqual(dbPayment.userId, testUser.id);
        assert.strictEqual(dbPayment.organizationId, testOrg.id);
        assert.strictEqual(dbPayment.amount, 50000);
        assert.strictEqual(dbPayment.currency, 'INR');
        assert.strictEqual(dbPayment.status, PaymentStatus.PENDING);
      } finally {
        (paymentService as any).getRazorpayInstance = originalGetRazorpay;
      }
    });

    it('returns existing pending order idempotently without creating duplicate DB records', async () => {
      // Calling create-order again within 15 minutes should return the existing active pending order
      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ organizationId: testOrg.id }),
      });

      assert.strictEqual(res.status, 200);
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.orderId, createdOrderId);
      assert.strictEqual(json.data.isExisting, true);

      // Verify no duplicate pending payment was created in Prisma
      const paymentCount = await prisma.payment.count({
        where: { userId: testUser.id, organizationId: testOrg.id },
      });
      assert.strictEqual(paymentCount, 1);
    });

    it('prevents duplicate charges if user already has an active membership with dues paid', async () => {
      // Create active member role for testUser in testOrg with duesPaid = true
      await prisma.userRole.create({
        data: {
          id: uuidv7(),
          userId: testUser.id,
          organizationId: testOrg.id,
          role: RoleType.MEMBER,
          duesPaid: true,
          validUntil: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 300 days active
        },
      });

      // Clear the pending payment to test active membership constraint
      await prisma.payment.deleteMany({
        where: { userId: testUser.id, organizationId: testOrg.id },
      });

      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ organizationId: testOrg.id }),
      });

      assert.strictEqual(res.status, 409);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.message, /already paid.*active/i);

      // Cleanup the role for subsequent tests
      await prisma.userRole.deleteMany({
        where: { userId: testUser.id, organizationId: testOrg.id },
      });
    });
  });

  // =========================================================================
  // 5. Razorpay Gateway Failure Handling
  // =========================================================================
  describe('POST /api/payment/create-order - Razorpay Failure Handling', () => {
    it('returns 502 with friendly error message when Razorpay orders.create fails', async () => {
      const originalGetRazorpay = (paymentService as any).getRazorpayInstance;
      (paymentService as any).getRazorpayInstance = () => ({
        orders: {
          create: async () => {
            const err: any = new Error('Gateway timeout or invalid merchant account');
            err.error = { description: 'Razorpay upstream gateway error' };
            throw err;
          },
        },
      });

      try {
        const res = await fetch(`${baseUrl}/api/payment/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testUserToken}`,
          },
          body: JSON.stringify({ organizationId: testOrg.id }),
        });

        assert.strictEqual(res.status, 502);
        const json: any = await res.json();
        assert.strictEqual(json.success, false);
        assert.match(json.message, /Failed to initialize order with Razorpay/i);
        // Verify secrets are not leaked
        assert.strictEqual((json as any).keySecret, undefined);
      } finally {
        (paymentService as any).getRazorpayInstance = originalGetRazorpay;
      }
    });
  });

  // =========================================================================
  // 6. Webhook Processing and Signature Verification
  // =========================================================================
  describe('POST /api/payment/webhook - Raw Body Signature & Membership Activation', () => {
    let pendingPayment: any;
    const webhookOrderId = `order_wh_${Date.now()}`;
    const webhookPayId = `pay_wh_${Date.now()}`;

    before(async () => {
      // Create pending payment in DB
      pendingPayment = await prisma.payment.create({
        data: {
          id: uuidv7(),
          userId: testUser.id,
          organizationId: testOrg.id,
          amount: 50000,
          currency: 'INR',
          status: PaymentStatus.PENDING,
          razorpayOrderId: webhookOrderId,
        },
      });

      // Create a pending membership application to test automatic approval on payment
      await prisma.membershipApplication.create({
        data: {
          id: uuidv7(),
          userId: testUser.id,
          organizationId: testOrg.id,
          status: ApplicationStatus.PENDING,
        },
      });
    });

    it('rejects webhook with invalid or tampered signature', async () => {
      const payload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: webhookPayId, order_id: webhookOrderId, amount: 50000 },
          },
        },
      });

      const res = await fetch(`${baseUrl}/api/payment/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'tampered_signature_hex_123',
        },
        body: payload,
      });

      assert.strictEqual(res.status, 400);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /Invalid webhook signature/i);
    });

    it('processes valid payment.captured webhook, updates payment to CAPTURED, and activates membership', async () => {
      const payload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: webhookPayId,
              order_id: webhookOrderId,
              amount: 50000,
              currency: 'INR',
              notes: {
                organizationId: testOrg.id,
                userId: testUser.id,
              },
            },
          },
        },
      });

      const genuineSignature = crypto
        .createHmac('sha256', testSecret)
        .update(Buffer.from(payload, 'utf8'))
        .digest('hex');

      const res = await fetch(`${baseUrl}/api/payment/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': genuineSignature,
        },
        body: payload,
      });

      assert.strictEqual(res.status, 200);
      const json: any = await res.json();
      assert.strictEqual(json.received, true);

      // Verify payment was transitioned to CAPTURED
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: pendingPayment.id },
      });
      assert.ok(updatedPayment);
      assert.strictEqual(updatedPayment.status, PaymentStatus.CAPTURED);
      assert.strictEqual(updatedPayment.razorpayPaymentId, webhookPayId);
      assert.ok(updatedPayment.capturedAt);

      // Verify membership was activated in UserRole with duesPaid: true
      const userRole = await prisma.userRole.findFirst({
        where: { userId: testUser.id, organizationId: testOrg.id },
      });
      assert.ok(userRole);
      assert.strictEqual(userRole.role, RoleType.MEMBER);
      assert.strictEqual(userRole.duesPaid, true);
      assert.ok(userRole.validUntil && userRole.validUntil > new Date());

      // Verify membership application was marked APPROVED
      const appRecord = await prisma.membershipApplication.findFirst({
        where: { userId: testUser.id, organizationId: testOrg.id },
      });
      assert.ok(appRecord);
      assert.strictEqual(appRecord.status, ApplicationStatus.APPROVED);

      // Verify student received confirmation notification
      const notification = await prisma.notification.findFirst({
        where: { userId: testUser.id, type: 'MEMBERSHIP_APPROVED' },
      });
      assert.ok(notification);
    });
  });

  // =========================================================================
  // 7. Client Payment Verification Endpoint (/api/payment/verify)
  // =========================================================================
  describe('POST /api/payment/verify - Payment Verification & Capture', () => {
    let verifyPendingPayment: any;
    const verifyOrderId = `order_ver_${Date.now()}`;
    const verifyPayId = `pay_ver_${Date.now()}`;

    before(async () => {
      // Clear roles
      await prisma.userRole.deleteMany({
        where: { userId: testUser.id, organizationId: testOrg.id },
      });

      verifyPendingPayment = await prisma.payment.create({
        data: {
          id: uuidv7(),
          userId: testUser.id,
          organizationId: testOrg.id,
          amount: 50000,
          currency: 'INR',
          status: PaymentStatus.PENDING,
          razorpayOrderId: verifyOrderId,
        },
      });
    });

    it('rejects verification when signature is invalid', async () => {
      const res = await fetch(`${baseUrl}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({
          orderId: verifyOrderId,
          paymentId: verifyPayId,
          signature: 'forged_signature_000',
        }),
      });

      assert.strictEqual(res.status, 400);
      const json: any = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.message, /Invalid or forged/i);
    });

    it('successfully verifies genuine signature and marks payment CAPTURED', async () => {
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${verifyOrderId}|${verifyPayId}`)
        .digest('hex');

      const res = await fetch(`${baseUrl}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({
          orderId: verifyOrderId,
          paymentId: verifyPayId,
          signature: validSignature,
        }),
      });

      assert.strictEqual(res.status, 200);
      const json: any = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.payment.status, PaymentStatus.CAPTURED);
      assert.strictEqual(json.payment.paymentId, verifyPayId);

      // Verify DB consistency
      const dbPayment = await prisma.payment.findUnique({
        where: { id: verifyPendingPayment.id },
      });
      assert.ok(dbPayment);
      assert.strictEqual(dbPayment.status, PaymentStatus.CAPTURED);
      assert.strictEqual(dbPayment.razorpaySignature, validSignature);
    });
  });
});

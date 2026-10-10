import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '../src/utils/payment.js';

describe('Razorpay Cryptographic Signature Verification', () => {
  const secret = 'test_secret_key_12345';
  const orderId = 'order_DA238dk291';
  const paymentId = 'pay_9271638291';

  // Helper to generate genuine signature for testing
  const generateSignature = (payload, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
  };

  describe('verifyRazorpayPaymentSignature', () => {
    it('returns true for a genuine, matching signature', () => {
      const validSignature = generateSignature(`${orderId}|${paymentId}`, secret);

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        secret,
      });

      expect(isValid).toBe(true);
    });

    it('returns false when signature has been tampered with', () => {
      const validSignature = generateSignature(`${orderId}|${paymentId}`, secret);
      const tamperedSignature = validSignature.substring(0, validSignature.length - 2) + '00';

      const isValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: tamperedSignature,
        secret,
      });

      expect(isValid).toBe(false);
    });

    it('returns false when orderId or paymentId do not match signature', () => {
      const validSignature = generateSignature(`${orderId}|${paymentId}`, secret);

      const isValid = verifyRazorpayPaymentSignature({
        orderId: 'different_order_id',
        paymentId,
        signature: validSignature,
        secret,
      });

      expect(isValid).toBe(false);
    });

    it('returns false when required parameters are missing or empty', () => {
      expect(
        verifyRazorpayPaymentSignature({ orderId: '', paymentId, signature: 'xyz', secret })
      ).toBe(false);
      expect(
        verifyRazorpayPaymentSignature({ orderId, paymentId: '', signature: 'xyz', secret })
      ).toBe(false);
      expect(
        verifyRazorpayPaymentSignature({ orderId, paymentId, signature: '', secret })
      ).toBe(false);
      expect(
        verifyRazorpayPaymentSignature({ orderId, paymentId, signature: 'xyz', secret: '' })
      ).toBe(false);
    });
  });

  describe('verifyRazorpayWebhookSignature', () => {
    it('returns true for valid webhook payload and signature', () => {
      const payload = JSON.stringify({ event: 'payment.captured', entity: { id: paymentId } });
      const validWebhookSignature = generateSignature(payload, secret);

      const isValid = verifyRazorpayWebhookSignature({
        payload,
        signature: validWebhookSignature,
        secret,
      });

      expect(isValid).toBe(true);
    });

    it('returns false for tampered webhook payload', () => {
      const payload = JSON.stringify({ event: 'payment.captured', entity: { id: paymentId } });
      const validWebhookSignature = generateSignature(payload, secret);

      const isValid = verifyRazorpayWebhookSignature({
        payload: JSON.stringify({ event: 'payment.failed' }),
        signature: validWebhookSignature,
        secret,
      });

      expect(isValid).toBe(false);
    });
  });
});

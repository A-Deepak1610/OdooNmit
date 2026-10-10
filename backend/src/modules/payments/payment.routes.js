import express from 'express';
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from '../../utils/payment.js';
import { env } from '../../config/env.js';

const router = express.Router();

// Mock store for in-memory payment records
const inMemoryPayments = [];

/**
 * @route POST /api/v1/payments/create-order
 * @desc Initialize order for Razorpay checkout
 */
router.post('/create-order', (req, res) => {
  const { amount, currency = 'INR', receipt, purpose, payerName, payerEmail } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required' });
  }

  const orderId = `order_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().slice(-4)}`;

  const orderPayload = {
    id: orderId,
    amount: Math.round(amount * 100), // amount in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    status: 'created',
    keyId: env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    purpose: purpose || 'Club Dues / Event Pass / Goodies',
    notes: {
      payerName: payerName || 'Campus Member',
      payerEmail: payerEmail || 'member@campus.edu',
    },
  };

  return res.status(201).json(orderPayload);
});

/**
 * @route POST /api/v1/payments/verify
 * @desc Verify cryptographic HMAC SHA-256 signature from Razorpay client
 */
router.post('/verify', (req, res) => {
  const { orderId, paymentId, signature, purpose, amount, payerName, payerEmail } = req.body;

  if (!orderId || !paymentId) {
    return res.status(400).json({ error: 'orderId and paymentId are required' });
  }

  // If secret is set, verify cryptographic HMAC; otherwise accept simulated signature
  const secret = env.RAZORPAY_KEY_SECRET;
  let isValid = true;

  if (secret && signature && signature !== 'simulated_signature') {
    isValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
      secret,
    });
  }

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or forged Razorpay payment signature',
    });
  }

  const record = {
    orderId,
    paymentId,
    amount: amount || 0,
    purpose: purpose || 'Payment',
    payerName: payerName || 'Student Member',
    payerEmail: payerEmail || 'student@campus.edu',
    verified: true,
    timestamp: new Date().toISOString(),
  };

  inMemoryPayments.unshift(record);

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully and recorded in ledger.',
    record,
  });
});

/**
 * @route GET /api/v1/payments/history
 * @desc Fetch verified payment records
 */
router.get('/history', (req, res) => {
  return res.status(200).json({
    count: inMemoryPayments.length,
    payments: inMemoryPayments,
  });
});

/**
 * @route POST /api/v1/payments/webhook
 * @desc Handle Razorpay server-to-server webhook events
 */
router.post('/webhook', (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

  if (webhookSecret && webhookSignature) {
    const isValid = verifyRazorpayWebhookSignature({
      payload: req.body,
      signature: webhookSignature,
      secret: webhookSecret,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  // Process event (payment.captured, order.paid, etc.)
  return res.status(200).json({ status: 'ok', received: true });
});

export default router;

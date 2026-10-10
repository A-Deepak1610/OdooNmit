import crypto from 'crypto';

/**
 * Verifies the authenticity of a Razorpay payment response signature.
 * Uses constant-time comparison (crypto.timingSafeEqual) to prevent timing attack vulnerabilities.
 *
 * @param {object} params
 * @param {string} params.orderId - Razorpay order ID (e.g. order_xyz)
 * @param {string} params.paymentId - Razorpay payment ID (e.g. pay_xyz)
 * @param {string} params.signature - Signature received from client/checkout
 * @param {string} params.secret - Razorpay Key Secret from environment
 * @returns {boolean} True if signature is valid and authentic, false otherwise
 */
export const verifyRazorpayPaymentSignature = ({ orderId, paymentId, signature, secret }) => {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }

  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
};

/**
 * Verifies incoming Razorpay webhook signature.
 *
 * @param {object} params
 * @param {string|Buffer} params.payload - Raw request body string or buffer
 * @param {string} params.signature - Value of 'x-razorpay-signature' header
 * @param {string} params.secret - Webhook secret from Razorpay dashboard
 * @returns {boolean} True if webhook signature matches
 */
export const verifyRazorpayWebhookSignature = ({ payload, signature, secret }) => {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
};

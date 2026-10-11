import crypto from 'crypto';

export interface VerifyPaymentSignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}

export interface VerifyWebhookSignatureParams {
  payload: string | Buffer;
  signature: string;
  secret: string;
}

/**
 * Verifies the authenticity of a Razorpay payment response signature.
 * Uses constant-time comparison (crypto.timingSafeEqual) to prevent timing attack vulnerabilities.
 */
export const verifyRazorpayPaymentSignature = ({
  orderId,
  paymentId,
  signature,
  secret,
}: VerifyPaymentSignatureParams): boolean => {
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
 * Verifies incoming Razorpay webhook signature against raw request body.
 * Uses constant-time comparison (crypto.timingSafeEqual).
 */
export const verifyRazorpayWebhookSignature = ({
  payload,
  signature,
  secret,
}: VerifyWebhookSignatureParams): boolean => {
  if (!payload || !signature || !secret) {
    return false;
  }

  try {
    const rawBody = Buffer.isBuffer(payload)
      ? payload
      : typeof payload === 'string'
      ? Buffer.from(payload, 'utf8')
      : Buffer.from(JSON.stringify(payload), 'utf8');

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

import { Request, Response } from 'express';
import { paymentService } from './payment.service.js';
import { sendError } from '../../common/utils/api-response.util.js';

export class PaymentController {
  /**
   * POST /api/payment/create-order
   * Authenticated endpoint to initialize a Razorpay order.
   * Calculates the real amount from the database based on club membership or event booking.
   */
  async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Authentication required. No user token provided.', 401);
      }

      const { organizationId, clubId, bookingId, eventId, purpose } = req.body;

      if (!organizationId && !clubId && !bookingId && !eventId) {
        return sendError(
          res,
          'Validation error: organizationId or bookingId is required to create a payment order.',
          400
        );
      }

      const result = await paymentService.createOrder({
        userId,
        organizationId,
        clubId,
        bookingId,
        eventId,
        purpose,
      });

      const httpStatus = result.isExisting ? 200 : 201;

      return res.status(httpStatus).json({
        success: true,
        message: result.isExisting
          ? 'Active pending payment order retrieved.'
          : 'Razorpay payment order created successfully.',
        orderId: result.orderId,
        order_id: result.orderId,
        id: result.id,
        amount: result.amount,
        currency: result.currency,
        keyId: result.keyId,
        key_id: result.keyId,
        data: {
          orderId: result.orderId,
          order_id: result.orderId,
          id: result.id,
          amount: result.amount,
          currency: result.currency,
          keyId: result.keyId,
          key_id: result.keyId,
          paymentRecordId: result.paymentRecordId,
          organizationId: result.organizationId,
          bookingId: result.bookingId,
          purpose: result.purpose,
          isExisting: result.isExisting,
        },
      });
    } catch (err: any) {
      console.error('[PaymentController] createOrder error:', err.message);
      const statusCode = err.statusCode || 500;
      return sendError(res, err.message || 'Failed to create payment order.', statusCode);
    }
  }

  /**
   * POST /api/payment/verify
   * Authenticated endpoint to verify client HMAC SHA-256 signature from Razorpay Checkout handler.
   */
  async verifyPayment(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 'Authentication required.', 401);
      }

      const { orderId, paymentId, signature } = req.body;
      if (!orderId || !paymentId || !signature) {
        return sendError(
          res,
          'Missing parameters: orderId, paymentId, and signature are required.',
          400
        );
      }

      const result = await paymentService.verifyPayment({
        userId,
        orderId,
        paymentId,
        signature,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[PaymentController] verifyPayment error:', err.message);
      const statusCode = err.statusCode || 500;
      return sendError(res, err.message || 'Payment verification failed.', statusCode);
    }
  }

  /**
   * POST /api/payment/webhook
   * Public webhook endpoint called by Razorpay server-to-server.
   * Uses raw body bytes to verify HMAC SHA-256 signature against webhook secret.
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || '';
      const rawBody = (req as any).rawBody || req.body;

      const result = await paymentService.handleWebhook(rawBody, signature, req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[PaymentController] handleWebhook error:', err.message);
      const statusCode = err.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        error: err.message || 'Webhook processing failed.',
      });
    }
  }
}

export const paymentController = new PaymentController();

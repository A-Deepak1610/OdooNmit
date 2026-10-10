import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';

export const paymentRouter = Router();

/**
 * @route POST /api/payment/create-order
 * @desc Initialize Razorpay order with database-verified amount
 * @access Authenticated (JWT)
 */
paymentRouter.post('/create-order', authenticateJwt, (req, res) =>
  paymentController.createOrder(req, res)
);

/**
 * @route POST /api/payment/verify
 * @desc Verify cryptographic HMAC signature from checkout modal
 * @access Authenticated (JWT)
 */
paymentRouter.post('/verify', authenticateJwt, (req, res) =>
  paymentController.verifyPayment(req, res)
);

/**
 * @route POST /api/payment/webhook
 * @desc Handle Razorpay server-to-server webhook notifications
 * @access Public (cryptographically verified by x-razorpay-signature header)
 */
paymentRouter.post('/webhook', (req, res) =>
  paymentController.handleWebhook(req, res)
);

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

// Google OAuth 2.0 endpoints
router.get('/google', authController.startGoogleAuth);
router.get('/google/callback', authController.googleCallback);

// Token lifecycle endpoints
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

// Quick 1-click role login for seeded demo accounts
router.post('/demo-login', authController.demoLogin);

// Authenticated user session info
router.get('/me', authenticate, authController.getMe);

export default router;

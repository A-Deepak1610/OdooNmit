import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.post('/google', (req, res) => authController.googleLogin(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));

router.get('/me', authenticateJwt, (req, res) => authController.me(req, res));
router.post('/logout', authenticateJwt, (req, res) => authController.logout(req, res));

export const authRouter = router;

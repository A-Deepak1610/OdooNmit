import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticateJwt } from '../../common/middlewares/auth.middleware.js';
import { requireRoles } from '../../common/middlewares/role.middleware.js';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.post('/switch-role', (req, res) => userController.switchRole(req, res));
router.get('/all', requireRoles(['ADMIN']), (req, res) => userController.listUsers(req, res));

export const userRouter = router;

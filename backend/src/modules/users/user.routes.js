import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.middleware.js';

const router = Router();

// Protected profile routes
router.get('/me', authenticate, userController.getProfile);
router.get('/:id', authenticate, userController.getProfile);

// Role inspection
router.get('/:id/roles', authenticate, userController.getUserRoles);

// Role management (restricted to ADMIN or PRESIDENT)
router.post(
  '/:id/roles',
  authenticate,
  requireRoles('ADMIN', 'PRESIDENT'),
  userController.assignRole
);

router.delete(
  '/:id/roles/:role',
  authenticate,
  requireRoles('ADMIN', 'PRESIDENT'),
  userController.removeRole
);

export default router;

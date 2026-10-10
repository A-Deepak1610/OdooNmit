import { Response } from 'express';
import { userService } from './user.service.js';
import { AuthenticatedRequest } from '../../common/middlewares/auth.middleware.js';
import { sendSuccess, sendError } from '../../common/utils/api-response.util.js';
import { switchRoleSchema } from '../auth/auth.validation.js';
import { RoleType } from '@prisma/client';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Unauthorized', 401);
      }
      const user = await userService.getUserById(req.user.userId);
      return sendSuccess(res, user, 'Profile loaded');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  async switchRole(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const parsed = switchRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Valid target role required', 400);
      }

      const result = await userService.switchRole(req.user.userId, parsed.data.role as RoleType);
      return sendSuccess(res, result, `Switched active role to ${parsed.data.role}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return sendSuccess(res, users, 'Users retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const userController = new UserController();

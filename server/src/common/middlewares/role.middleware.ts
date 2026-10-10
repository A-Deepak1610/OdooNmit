import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response.util.js';

export const requireRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      sendError(res, `Forbidden. Required role: ${allowedRoles.join(' or ')}.`, 403);
      return;
    }

    next();
  };
};

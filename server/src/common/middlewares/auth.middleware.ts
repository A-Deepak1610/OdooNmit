import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token.util.js';
import { sendError } from '../utils/api-response.util.js';
import jwt from 'jsonwebtoken';

export type AuthenticatedRequest = Request;

export const authenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. No Bearer token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendError(res, 'Access token has expired. Please refresh your session.', 401, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'Invalid authentication token.', 401);
  }
};

export const extractExpiredTokenPayload = (authHeader?: string): TokenPayload | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../../config/env.js';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  activeRole: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;
};

export const generateRefreshTokenString = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

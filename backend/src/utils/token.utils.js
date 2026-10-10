import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './app-error.js';

/**
 * Creates a SHA-256 hex digest of a raw token.
 * Used to securely store hashed refresh tokens in the database.
 *
 * @param {string} rawToken
 * @returns {string} SHA-256 hash string
 */
export const hashToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new AppError('Invalid token for hashing', 400);
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Generates a cryptographically secure random string for refresh tokens.
 *
 * @returns {string} Hex encoded random string
 */
export const generateRawRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Signs a short-lived JSON Web Token for API authentication.
 *
 * @param {object} payload - Claims to embed in token (e.g. sub, email, roles)
 * @param {string} [expiresIn] - Optional override for token expiry
 * @returns {string} Encoded JWT access token
 */
export const signAccessToken = (payload, expiresIn = env.JWT_ACCESS_EXPIRES_IN) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
};

/**
 * Verifies and decodes a JSON Web Token.
 *
 * @param {string} token - Bearer JWT string
 * @returns {object} Decoded token payload
 * @throws {AppError} When token is expired or malformed
 */
export const verifyAccessToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new AppError('Authentication token missing or invalid', 401);
  }

  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Authentication token expired. Please refresh your session.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Invalid authentication token signature', 401);
    }
    throw new AppError('Authentication verification failed', 401);
  }
};

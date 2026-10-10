import crypto from 'crypto';

/**
 * Attaches a unique request ID to each incoming request and response headers.
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

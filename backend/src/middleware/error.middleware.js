import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Global centralized error-handling middleware.
 * Ensures consistent JSON response and scrubs internal database or stack details.
 */
export const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;
  const isOperational = Boolean(err.isOperational);

  // Safe message exposure: operational client errors get their message; internal errors get a safe message in production
  const safeMessage = (isClientError || isOperational || !env.isProduction)
    ? err.message
    : 'Internal server error. Please try again later.';

  // Log error on server side with request context
  logger.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${err.message}`, {
    requestId: req.id,
    stack: env.isProduction ? undefined : err.stack,
  });

  const response = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    statusCode,
    message: safeMessage,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  if (err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};

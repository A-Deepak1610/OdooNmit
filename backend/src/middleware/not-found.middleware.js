import { AppError } from '../utils/app-error.js';

/**
 * 404 Not Found route handler
 */
export const notFoundMiddleware = (req, res, next) => {
  next(new AppError(`Resource not found: ${req.method} ${req.originalUrl}`, 404));
};

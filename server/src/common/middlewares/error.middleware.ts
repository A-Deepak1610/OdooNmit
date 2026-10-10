import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response.util.js';
import { ENV } from '../../config/env.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(
    res,
    message,
    statusCode,
    ENV.NODE_ENV === 'development' ? err.stack : undefined
  );
};

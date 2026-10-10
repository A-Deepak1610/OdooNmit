import { AppError } from '../utils/app-error.js';

/**
 * Validates that specified required fields are present in the request body.
 *
 * @param {string[]} requiredFields - List of required property keys in req.body
 * @returns {Function} Express middleware handler
 */
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return next(new AppError('Validation error: Request body must be a JSON object', 400));
    }

    const missingFields = requiredFields.filter((field) => {
      const val = req.body[field];
      return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
    });

    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Validation failed: Missing or empty required field(s): ${missingFields.join(', ')}`,
          400,
          { missingFields }
        )
      );
    }

    next();
  };
};

/**
 * Validates that specified query parameters are present in req.query.
 *
 * @param {string[]} requiredQueryParams - List of required query parameters
 * @returns {Function} Express middleware handler
 */
export const validateQuery = (requiredQueryParams = []) => {
  return (req, res, next) => {
    const missingParams = requiredQueryParams.filter((param) => {
      const val = req.query[param];
      return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
    });

    if (missingParams.length > 0) {
      return next(
        new AppError(
          `Validation failed: Missing query parameter(s): ${missingParams.join(', ')}`,
          400,
          { missingParams }
        )
      );
    }

    next();
  };
};

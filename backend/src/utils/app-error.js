/**
 * Standard Operational Application Error class.
 * Ensures consistent HTTP status codes and safe client-facing messages.
 */
export class AppError extends Error {
  /**
   * @param {string} message - User-safe error description
   * @param {number} [statusCode=500] - HTTP status code
   * @param {object} [details=null] - Optional structured validation/diagnostic details
   */
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

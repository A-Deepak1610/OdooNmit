/**
 * Wrapper for Express async route handlers to forward errors to the central error middleware.
 * @param {Function} fn - Async express route handler function
 * @returns {Function} Express middleware handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

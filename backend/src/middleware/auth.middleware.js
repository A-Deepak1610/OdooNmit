import { verifyAccessToken } from '../utils/token.utils.js';
import { AppError } from '../utils/app-error.js';

/**
 * Authentication middleware: verifies incoming JWT Bearer token.
 * Populates `req.user` with `{ id, email, name, roles }`.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next(new AppError('Authentication required. Empty token provided.', 401));
  }

  try {
    const payload = verifyAccessToken(token);
    
    // Attach decoded identity and role names to the request
    req.user = {
      id: payload.sub,
      email: payload.email || null,
      name: payload.name || null,
      roles: Array.isArray(payload.roles) ? payload.roles : [],
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Convenient alias for authenticate
export const authenticateUser = authenticate;

/**
 * Authorization middleware: restricts route access to specified roles.
 *
 * @param {...string} allowedRoles - List of permitted role identifiers
 * @returns {Function} Express middleware
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check.', 401));
    }

    const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    const hasRole = normalizedAllowed.some((role) =>
      userRoles.map((r) => r.toUpperCase()).includes(role)
    );

    if (!hasRole) {
      return next(
        new AppError(
          `Forbidden: Insufficient privileges. Required one of: ${allowedRoles.join(', ')}`,
          403,
          { requiredRoles: allowedRoles, currentRoles: userRoles }
        )
      );
    }

    next();
  };
};

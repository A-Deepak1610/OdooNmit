import { AppError } from '../../utils/app-error.js';

export const VALID_ROLES = [
  'STUDENT',
  'MEMBER',
  'VOLUNTEER',
  'EVENT_ORGANIZER',
  'TREASURER',
  'PRESIDENT',
  'ADMIN',
];

export const userValidation = {
  validateRole(role) {
    if (!role || typeof role !== 'string') {
      throw new AppError('Role name is required and must be a string', 400);
    }

    const normalizedRole = role.toUpperCase();
    if (!VALID_ROLES.includes(normalizedRole)) {
      throw new AppError(
        `Invalid role: "${role}". Supported roles are: ${VALID_ROLES.join(', ')}`,
        400
      );
    }

    return normalizedRole;
  },

  validateUserId(userId) {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new AppError('A valid user ID is required', 400);
    }
    return userId.trim();
  },
};

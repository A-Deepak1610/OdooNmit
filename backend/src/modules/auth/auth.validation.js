import { AppError } from '../../utils/app-error.js';

export const authValidation = {
  validateRefreshTokenInput(body) {
    if (!body || typeof body !== 'object') {
      throw new AppError('Request body is required', 400);
    }

    const { refreshToken } = body;
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      throw new AppError('Valid refreshToken is required', 400);
    }

    return refreshToken.trim();
  },

  validateOAuthCallbackQuery(query) {
    if (!query || typeof query !== 'object') {
      throw new AppError('Invalid callback query parameters', 400);
    }

    if (query.error) {
      throw new AppError(`Google OAuth error: ${query.error}`, 400);
    }

    const { code } = query;
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new AppError('Authorization code missing from Google callback', 400);
    }

    return {
      code: code.trim(),
      state: typeof query.state === 'string' ? query.state : null,
    };
  },
};

import { authService } from './auth.service.js';
import { authValidation } from './auth.validation.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { env } from '../../config/env.js';

export const authController = {
  /**
   * Initiates Google OAuth flow.
   * Responds with the Google Auth URL or redirects directly.
   */
  startGoogleAuth: asyncHandler(async (req, res) => {
    const state = req.query.state || null;
    const authUrl = authService.getGoogleAuthUrl(state);

    // If client requested direct redirection (e.g. from browser link)
    if (req.query.redirect === 'true') {
      return res.redirect(authUrl);
    }

    res.status(200).json({
      status: 'success',
      data: {
        authUrl,
      },
    });
  }),

  /**
   * Handles callback from Google OAuth redirect.
   * Returns tokens as JSON or redirects to the frontend with token params.
   */
  googleCallback: asyncHandler(async (req, res) => {
    const { code } = authValidation.validateOAuthCallbackQuery(req.query);
    const result = await authService.handleGoogleCallback(code);

    // Content negotiation: redirect browser navigations to frontend application
    const isBrowserNavigation = req.headers.accept ? req.headers.accept.includes('text/html') : false;
    const isRedirectRequested = (isBrowserNavigation || req.query.redirect === 'true') && req.query.format !== 'json';

    if (isRedirectRequested && env.FRONTEND_URL) {
      const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);
      return res.redirect(redirectUrl.toString());
    }

    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: result,
    });
  }),

  /**
   * Refreshes access token and rotates the refresh token.
   */
  refreshToken: asyncHandler(async (req, res) => {
    const rawRefreshToken = authValidation.validateRefreshTokenInput(req.body);
    const result = await authService.rotateRefreshToken(rawRefreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Tokens refreshed successfully',
      data: result,
    });
  }),

  /**
   * Terminates session by revoking the refresh token.
   */
  logout: asyncHandler(async (req, res) => {
    const rawRefreshToken = authValidation.validateRefreshTokenInput(req.body);
    const result = await authService.logout(rawRefreshToken);

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  }),

  /**
   * Returns authenticated user info and roles from the decoded token.
   */
  getMe: asyncHandler(async (req, res) => {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  }),
};

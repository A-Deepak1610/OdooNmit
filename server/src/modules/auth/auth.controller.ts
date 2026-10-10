import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess, sendError } from '../../common/utils/api-response.util.js';
import { loginSchema, googleTokenSchema } from './auth.validation.js';
import { AuthenticatedRequest, extractExpiredTokenPayload } from '../../common/middlewares/auth.middleware.js';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0]?.message || 'Invalid login details', 400);
      }

      const clientInfo = {
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.loginWithCredentials(
        parsed.data.identifier,
        parsed.data.password,
        clientInfo
      );

      res.cookie('campusmitra_session', result.refreshTokenInternal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          user: result.user,
        },
        'Login successful'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Login failed', 401);
    }
  }

  async googleLogin(req: Request, res: Response) {
    try {
      const parsed = googleTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'A valid Google ID Token is required', 400);
      }

      const clientInfo = {
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await authService.loginWithGoogleToken(parsed.data.idToken, clientInfo);

      res.cookie('campusmitra_session', result.refreshTokenInternal, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          user: result.user,
        },
        'Google login successful'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Google authentication failed', 400);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      let userId = req.body?.userId;

      if (!userId && req.headers.authorization) {
        const payload = extractExpiredTokenPayload(req.headers.authorization);
        if (payload?.userId) {
          userId = payload.userId;
        }
      }

      if (!userId) {
        return sendError(res, 'Unable to identify user session for refresh.', 401);
      }

      const result = await authService.refreshAccessToken(userId);

      return sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          user: result.user,
        },
        'Access token refreshed successfully'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Refresh token validation failed', 401);
    }
  }

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      return sendSuccess(res, { user: req.user }, 'User session active');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.userId) {
        await authService.logout(req.user.userId);
      }
      res.clearCookie('campusmitra_session');
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const authController = new AuthController();

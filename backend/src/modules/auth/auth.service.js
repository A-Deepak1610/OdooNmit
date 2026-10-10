import { authRepository } from './auth.repository.js';
import { prisma } from '../../config/database.js';
import { seedDatabase } from '../../database/seed.js';
import { env } from '../../config/env.js';
import {
  hashToken,
  generateRawRefreshToken,
  signAccessToken,
} from '../../utils/token.utils.js';
import { AppError } from '../../utils/app-error.js';
import { logger } from '../../utils/logger.js';

export const authService = {
  /**
   * Builds the Google OAuth 2.0 authorization URL.
   */
  getGoogleAuthUrl(state = null) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError(
        'Google OAuth client ID is not configured. Set GOOGLE_CLIENT_ID in your environment.',
        500
      );
    }

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  /**
   * Exchanges authorization code with Google and authenticates or creates user.
   */
  async handleGoogleCallback(code) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new AppError(
        'Google OAuth credentials are not fully configured in server environment.',
        500
      );
    }

    // 1. Exchange authorization code for Google tokens
    let tokenData;
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: env.GOOGLE_CALLBACK_URL,
          grant_type: 'authorization_code',
        }),
      });

      tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        logger.error('Google token exchange error', { error: tokenData });
        throw new AppError(
          tokenData.error_description || 'Failed to exchange authorization code with Google',
          400
        );
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error('Network error during Google token exchange', { message: err.message });
      throw new AppError('Unable to connect to Google authentication service', 502);
    }

    // 2. Fetch verified profile claims from Google userinfo endpoint
    let profileClaims;
    try {
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      profileClaims = await userinfoResponse.json();

      if (!userinfoResponse.ok) {
        throw new AppError('Failed to fetch user profile claims from Google', 400);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error('Error fetching Google userinfo', { message: err.message });
      throw new AppError('Unable to verify user details with Google', 502);
    }

    const { sub, email, email_verified, name, picture } = profileClaims;

    if (!sub || typeof sub !== 'string') {
      throw new AppError('Invalid Google identity: missing immutable subject ID', 400);
    }

    const isEmailVerified = Boolean(email_verified && email);
    const safeEmail = isEmailVerified ? email.toLowerCase().trim() : (email ? email.trim() : null);

    // 3. Find or create user via verified Google identity key (provider + sub)
    let user;
    const existingOAuthAccount = await authRepository.findOAuthAccount('google', sub);

    if (existingOAuthAccount) {
      user = existingOAuthAccount.user;

      if (user.status !== 'ACTIVE') {
        throw new AppError('Your account has been deactivated or suspended.', 403);
      }
      // Note: Existing roles are strictly preserved and never overwritten
    } else {
      // Create new user with default STUDENT role
      user = await authRepository.createOAuthUserWithAccount({
        provider: 'google',
        providerAccountId: sub,
        email: safeEmail,
        emailVerified: isEmailVerified,
        name: name || 'Student User',
        avatarUrl: picture || null,
        defaultRole: 'STUDENT',
      });
    }

    // 4. Extract assigned roles
    const roleNames = user.roles.map((r) => r.role);

    // 5. Issue short-lived JWT access token
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: roleNames,
    });

    // 6. Generate and store hashed refresh token
    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        status: user.status,
        roles: roleNames,
      },
    };
  },

  /**
   * Refreshes access token with full refresh-token rotation and reuse detection.
   */
  async rotateRefreshToken(rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    const session = await authRepository.findRefreshToken(tokenHash);

    if (!session) {
      throw new AppError('Invalid or unrecognized refresh token', 401);
    }

    // Reuse detection: if this token was already revoked, someone may have compromised it
    if (session.revokedAt) {
      logger.warn('Revoked refresh token presented for rotation. Possible token reuse.', {
        userId: session.userId,
      });
      throw new AppError('Refresh token has already been revoked. Please sign in again.', 401);
    }

    // Expiry check
    if (new Date(session.expiresAt) < new Date()) {
      throw new AppError('Refresh token expired. Please sign in again.', 401);
    }

    // Account status check
    if (session.user.status !== 'ACTIVE') {
      throw new AppError('Your account has been deactivated or suspended.', 403);
    }

    // Generate new replacement refresh token
    const newRawRefreshToken = generateRawRefreshToken();
    const newTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    // Revoke old token & link to new token hash
    await authRepository.revokeRefreshToken(tokenHash, newTokenHash);

    // Save new refresh token record
    await authRepository.createRefreshToken({
      userId: session.userId,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
    });

    // Issue updated access token with user's current roles from database
    const roleNames = session.user.roles.map((r) => r.role);
    const newAccessToken = signAccessToken({
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
      roles: roleNames,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.avatarUrl,
        roles: roleNames,
      },
    };
  },

  /**
   * Terminates session by revoking the presented refresh token.
   */
  async logout(rawRefreshToken) {
    try {
      const tokenHash = hashToken(rawRefreshToken);
      const session = await authRepository.findRefreshToken(tokenHash);

      if (session && !session.revokedAt) {
        await authRepository.revokeRefreshToken(tokenHash);
      }
    } catch (err) {
      // Fail safely without leaking token existence
      logger.warn('Logout revocation warning', { message: err.message });
    }

    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Quick role login for pre-seeded demo accounts.
   * Enables 1-click role exploration in development and evaluation.
   */
  async demoLogin(targetRole) {
    const roleUpper = (targetRole || 'STUDENT').toUpperCase();

    // Find demo user associated with this role
    let user = await prisma.user.findFirst({
      where: {
        roles: {
          some: {
            role: roleUpper,
          },
        },
      },
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // If no demo user found, automatically seed database
    if (!user) {
      await seedDatabase();
      user = await prisma.user.findFirst({
        where: {
          roles: {
            some: {
              role: roleUpper,
            },
          },
        },
        include: {
          roles: true,
        },
      });
    }

    if (!user) {
      throw new AppError(`Demo account for role ${roleUpper} could not be found.`, 404);
    }

    // Extract assigned roles
    const roleNames = user.roles.map((r) => r.role);

    // Issue short-lived JWT access token
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: roleNames,
    });

    // Generate and store hashed refresh token
    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        status: user.status,
        roles: roleNames,
      },
    };
  },
};

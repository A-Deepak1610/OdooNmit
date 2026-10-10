import { RoleType } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { generateId } from '../../common/utils/id.util.js';
import { comparePassword } from '../../common/utils/password.util.js';
import {
  generateAccessToken,
  generateRefreshTokenString,
  TokenPayload,
} from '../../common/utils/token.util.js';

const googleOAuthClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

const ROLE_HIERARCHY: RoleType[] = [
  RoleType.ADMIN,
  RoleType.PRESIDENT,
  RoleType.TREASURER,
  RoleType.EVENT_ORGANIZER,
  RoleType.VOLUNTEER,
  RoleType.MEMBER,
  RoleType.STUDENT,
];

export const getHighestPriorityRole = (roles: RoleType[]): RoleType => {
  if (!roles || roles.length === 0) return RoleType.STUDENT;
  for (const prio of ROLE_HIERARCHY) {
    if (roles.includes(prio)) return prio;
  }
  return RoleType.STUDENT;
};

export class AuthService {
  /**
   * Authenticate user with Username or Email and Password
   */
  async loginWithCredentials(
    identifier: string,
    password: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ) {
    const trimmedIdentifier = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedIdentifier },
          { email: trimmedIdentifier },
        ],
      },
      include: {
        roles: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid username/email or password.');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact the administrator.');
    }

    if (!user.passwordHash) {
      throw new Error('This account uses Google Sign-In. Please sign in with Google.');
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid username/email or password.');
    }

    const assignedRoles = user.roles.map((r) => r.role);
    const rolesList = assignedRoles.length > 0 ? assignedRoles : [RoleType.STUDENT];
    const defaultRole = getHighestPriorityRole(rolesList);

    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: rolesList,
      activeRole: defaultRole,
    };
    const accessToken = generateAccessToken(tokenPayload);

    // Generate refresh token and save in DB with UUIDv7
    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ENV.REFRESH_TOKEN_EXPIRES_DAYS);

    const dbRefreshToken = await prisma.refreshToken.create({
      data: {
        id: generateId(),
        userId: user.id,
        token: refreshTokenString,
        expiresAt,
        deviceInfo: clientInfo?.userAgent || 'Browser Session',
        ipAddress: clientInfo?.ip || 'Unknown IP',
      },
    });

    return {
      accessToken,
      refreshTokenInternal: dbRefreshToken.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        roles: rolesList,
        activeRole: defaultRole,
        organizations: user.roles
          .filter((r) => r.organization)
          .map((r) => ({
            id: r.organization!.id,
            name: r.organization!.name,
            slug: r.organization!.slug,
            role: r.role,
          })),
      },
    };
  }

  /**
   * Refresh JWT using valid DB stored refresh token
   */
  async refreshAccessToken(userId: string) {
    const activeRefreshToken = await prisma.refreshToken.findFirst({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeRefreshToken) {
      throw new Error('No active refresh session found. Please log in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new Error('User account not found or deactivated.');
    }

    const assignedRoles = user.roles.map((r) => r.role);
    const rolesList = assignedRoles.length > 0 ? assignedRoles : [RoleType.STUDENT];
    const defaultRole = getHighestPriorityRole(rolesList);

    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: rolesList,
      activeRole: defaultRole,
    };
    const newAccessToken = generateAccessToken(tokenPayload);

    return {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        roles: rolesList,
        activeRole: defaultRole,
      },
    };
  }

  /**
   * Google OAuth login via Verified ID Token
   */
  async loginWithGoogleToken(idToken: string, clientInfo?: { ip?: string; userAgent?: string }) {
    let payload;
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken,
        audience: ENV.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      throw new Error(`Google ID Token verification failed: ${err.message}`);
    }

    if (!payload || !payload.email) {
      throw new Error('Google payload did not contain valid email information.');
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const fullName = payload.name || 'Campus Student';
    const avatarUrl = payload.picture || null;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      const newUserId = generateId();
      const baseUsername = email.split('@')[0].replace(/[^a-z0-9_]/gi, '') + Math.floor(100 + Math.random() * 900);

      user = await prisma.user.create({
        data: {
          id: newUserId,
          username: baseUsername.toLowerCase(),
          email,
          fullName,
          avatarUrl,
          googleId,
          isEmailVerified: true,
          isActive: true,
        },
        include: {
          roles: true,
        },
      });

      await prisma.userRole.create({
        data: {
          id: generateId(),
          userId: user.id,
          role: RoleType.STUDENT,
        },
      });

      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: true },
      }) as any;
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          isEmailVerified: true,
          avatarUrl: user.avatarUrl || avatarUrl,
        },
        include: { roles: true },
      });
    }

    if (!user!.isActive) {
      throw new Error('Account has been deactivated.');
    }

    const assignedRoles = user!.roles.map((r) => r.role);
    const rolesList = assignedRoles.length > 0 ? assignedRoles : [RoleType.STUDENT];
    const defaultRole = getHighestPriorityRole(rolesList);

    const tokenPayload: TokenPayload = {
      userId: user!.id,
      username: user!.username,
      email: user!.email,
      roles: rolesList,
      activeRole: defaultRole,
    };
    const accessToken = generateAccessToken(tokenPayload);

    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ENV.REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.refreshToken.create({
      data: {
        id: generateId(),
        userId: user!.id,
        token: refreshTokenString,
        expiresAt,
        deviceInfo: clientInfo?.userAgent || 'Google Sign-In Device',
        ipAddress: clientInfo?.ip || 'Unknown IP',
      },
    });

    return {
      accessToken,
      refreshTokenInternal: refreshTokenString,
      user: {
        id: user!.id,
        username: user!.username,
        email: user!.email,
        fullName: user!.fullName,
        avatarUrl: user!.avatarUrl,
        roles: rolesList,
        activeRole: defaultRole,
      },
    };
  }

  async logout(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return { success: true };
  }
}

export const authService = new AuthService();

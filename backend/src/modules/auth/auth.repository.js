import { prisma } from '../../config/database.js';

export const authRepository = {
  /**
   * Find OAuth account by provider and subject ID.
   */
  async findOAuthAccount(provider, providerAccountId) {
    return prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });
  },

  /**
   * Creates a new user, connects their OAuth account, and assigns the initial role in a single transaction.
   */
  async createOAuthUserWithAccount({
    provider,
    providerAccountId,
    email,
    emailVerified,
    name,
    avatarUrl,
    defaultRole = 'STUDENT',
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create base user record
      const user = await tx.user.create({
        data: {
          name: name || null,
          email: email || null,
          avatarUrl: avatarUrl || null,
          status: 'ACTIVE',
        },
      });

      // 2. Create provider identity binding
      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId,
          email: email || null,
          emailVerified: Boolean(emailVerified),
        },
      });

      // 3. Assign default STUDENT role
      await tx.userRole.create({
        data: {
          userId: user.id,
          role: defaultRole,
        },
      });

      // 4. Return user with assigned roles
      return tx.user.findUnique({
        where: { id: user.id },
        include: {
          roles: true,
        },
      });
    });
  },

  /**
   * Create a new refresh token record with its hashed representation.
   */
  async createRefreshToken({ userId, tokenHash, expiresAt }) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  },

  /**
   * Find a refresh token by its hash, returning the associated user and their roles.
   */
  async findRefreshToken(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    });
  },

  /**
   * Revoke an active refresh token and link replacement hash if rotating.
   */
  async revokeRefreshToken(tokenHash, replacedByTokenHash = null) {
    return prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revokedAt: new Date(),
        replacedByTokenHash,
      },
    });
  },

  /**
   * Revoke all refresh tokens for a user.
   */
  async revokeAllUserTokens(userId) {
    return prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },
};

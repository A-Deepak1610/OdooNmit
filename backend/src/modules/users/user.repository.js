import { prisma } from '../../config/database.js';

export const userRepository = {
  /**
   * Find user by internal ID including roles and connected OAuth accounts.
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
        oauthAccounts: {
          select: {
            id: true,
            provider: true,
            email: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });
  },

  /**
   * Find user by email address.
   */
  async findByEmail(email) {
    if (!email) return null;
    return prisma.user.findFirst({
      where: { email },
      include: {
        roles: true,
      },
    });
  },

  /**
   * Get list of active role names for a user.
   */
  async getUserRoles(userId) {
    const roles = await prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });
    return roles.map((r) => r.role);
  },

  /**
   * Assign a role to a user. Idempotent: does not duplicate if already assigned.
   */
  async assignRole(userId, role) {
    return prisma.userRole.upsert({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
      create: {
        userId,
        role,
      },
      update: {},
    });
  },

  /**
   * Remove a role from a user.
   */
  async removeRole(userId, role) {
    return prisma.userRole.deleteMany({
      where: {
        userId,
        role,
      },
    });
  },

  /**
   * Update profile fields for a user.
   */
  async updateProfile(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: {
        roles: true,
      },
    });
  },
};

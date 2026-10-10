import { userRepository } from './user.repository.js';
import { userValidation } from './user.validation.js';
import { AppError } from '../../utils/app-error.js';

export const userService = {
  /**
   * Retrieves profile details and active roles for a user.
   */
  async getProfile(userId) {
    const validId = userValidation.validateUserId(userId);
    const user = await userRepository.findById(validId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.roles.map((r) => r.role),
      oauthProviders: user.oauthAccounts ? user.oauthAccounts.map((a) => a.provider) : [],
      clubMemberships: user.clubMemberships ? user.clubMemberships.map((m) => ({
        id: m.id,
        clubId: m.clubId,
        clubName: m.club?.name,
        clubSlug: m.club?.slug,
        membershipNumber: m.membershipNumber,
        tier: m.tier,
        status: m.status,
        duesPaid: m.duesPaid,
        joinedAt: m.joinedAt,
      })) : [],
      createdAt: user.createdAt,
    };
  },

  /**
   * Retrieves current roles assigned to a user.
   */
  async getRoles(userId) {
    const validId = userValidation.validateUserId(userId);
    const user = await userRepository.findById(validId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.roles.map((r) => r.role);
  },

  /**
   * Assigns an additional role to a user.
   */
  async assignRole(userId, role) {
    const validId = userValidation.validateUserId(userId);
    const validRole = userValidation.validateRole(role);

    const user = await userRepository.findById(validId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await userRepository.assignRole(validId, validRole);
    const updatedRoles = await userRepository.getUserRoles(validId);

    return {
      userId: validId,
      assignedRole: validRole,
      roles: updatedRoles,
    };
  },

  /**
   * Removes a role from a user.
   */
  async removeRole(userId, role) {
    const validId = userValidation.validateUserId(userId);
    const validRole = userValidation.validateRole(role);

    const user = await userRepository.findById(validId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await userRepository.removeRole(validId, validRole);
    const updatedRoles = await userRepository.getUserRoles(validId);

    return {
      userId: validId,
      removedRole: validRole,
      roles: updatedRoles,
    };
  },
};

import { RoleType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { generateAccessToken, TokenPayload } from '../../common/utils/token.util.js';

export class UserService {
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        roles: {
          select: {
            id: true,
            role: true,
            assignedAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async switchRole(userId: string, targetRole: RoleType) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const availableRoles = user.roles.map((r) => r.role);
    if (!availableRoles.includes(targetRole)) {
      throw new Error(`You do not possess the role permissions for: ${targetRole}`);
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: availableRoles,
      activeRole: targetRole,
    };

    const accessToken = generateAccessToken(payload);

    return {
      accessToken,
      activeRole: targetRole,
    };
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        roles: {
          select: {
            role: true,
            organization: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userService = new UserService();

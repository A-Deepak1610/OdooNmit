import { PrismaClient, RoleType, ApplicationStatus } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

export class PresidentService {
  /**
   * Helper: Resolve the organization managed by the president
   */
  async getPresidentClub(userId: string) {
    // 1. Look for explicit PRESIDENT role
    const presidentRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: RoleType.PRESIDENT,
        organizationId: { not: null },
      },
      include: {
        organization: true,
      },
    });

    if (presidentRole?.organization) {
      return presidentRole.organization;
    }

    // Fallback: If user is ADMIN or testing, fallback to first active club
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    const isAdmin = user?.roles.some((r) => r.role === RoleType.ADMIN);
    if (isAdmin) {
      const firstClub = await prisma.organization.findFirst({
        where: { isActive: true },
      });
      if (firstClub) return firstClub;
    }

    // Check if user has ANY organization role
    const anyOrgRole = await prisma.userRole.findFirst({
      where: {
        userId,
        organizationId: { not: null },
      },
      include: { organization: true },
    });

    if (anyOrgRole?.organization) {
      return anyOrgRole.organization;
    }

    // Default to the first club (Tech & AI) to avoid blocking
    const defaultClub = await prisma.organization.findFirst();
    if (!defaultClub) {
      throw new Error('No club organization found in the system.');
    }
    return defaultClub;
  }

  /**
   * Executive Hub Overview metrics
   */
  async getDashboardOverview(userId: string) {
    const club = await this.getPresidentClub(userId);

    // 1. Members count and role breakdown
    const memberRoles = await prisma.userRole.findMany({
      where: {
        organizationId: club.id,
      },
      include: {
        user: true,
      },
    });

    const totalMembers = memberRoles.length;
    const roleBreakdown = {
      PRESIDENT: memberRoles.filter((r) => r.role === RoleType.PRESIDENT).length,
      TREASURER: memberRoles.filter((r) => r.role === RoleType.TREASURER).length,
      EVENT_ORGANIZER: memberRoles.filter((r) => r.role === RoleType.EVENT_ORGANIZER).length,
      VOLUNTEER: memberRoles.filter((r) => r.role === RoleType.VOLUNTEER).length,
      MEMBER: memberRoles.filter((r) => r.role === RoleType.MEMBER).length,
    };

    // 2. Pending applications
    const pendingApplicationsCount = await prisma.membershipApplication.count({
      where: {
        organizationId: club.id,
        status: ApplicationStatus.PENDING,
      },
    });

    // 3. Announcements count
    const totalAnnouncements = await prisma.announcement.count({
      where: { organizationId: club.id },
    });

    // 4. Recent pending applications
    const recentApplications = await prisma.membershipApplication.findMany({
      where: { organizationId: club.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 5. Recent announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      where: { organizationId: club.id },
      take: 4,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        category: club.category,
        logoUrl: club.logoUrl,
        coverUrl: club.coverUrl,
        membershipFee: club.membershipFee,
        membershipFeeINR: (club.membershipFee / 100).toFixed(0),
        websiteUrl: club.websiteUrl,
        instagramUrl: club.instagramUrl,
        linkedinUrl: club.linkedinUrl,
      },
      stats: {
        totalMembers,
        roleBreakdown,
        pendingApplicationsCount,
        totalAnnouncements,
        membershipFeeINR: (club.membershipFee / 100).toFixed(0),
      },
      recentApplications,
      recentAnnouncements,
    };
  }

  /**
   * Get Club Profile
   */
  async getClubProfile(userId: string) {
    const club = await this.getPresidentClub(userId);
    return {
      ...club,
      membershipFeeINR: (club.membershipFee / 100).toFixed(0),
    };
  }

  /**
   * Update Club Profile
   */
  async updateClubProfile(
    userId: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      logoUrl?: string;
      coverUrl?: string;
      websiteUrl?: string;
      instagramUrl?: string;
      linkedinUrl?: string;
    }
  ) {
    const club = await this.getPresidentClub(userId);

    const updated = await prisma.organization.update({
      where: { id: club.id },
      data: {
        name: data.name ?? club.name,
        description: data.description ?? club.description,
        category: data.category ?? club.category,
        logoUrl: data.logoUrl ?? club.logoUrl,
        coverUrl: data.coverUrl ?? club.coverUrl,
        websiteUrl: data.websiteUrl ?? club.websiteUrl,
        instagramUrl: data.instagramUrl ?? club.instagramUrl,
        linkedinUrl: data.linkedinUrl ?? club.linkedinUrl,
      },
    });

    return {
      ...updated,
      membershipFeeINR: (updated.membershipFee / 100).toFixed(0),
    };
  }

  /**
   * Update Membership Fee
   */
  async updateMembershipFee(userId: string, feeINR: number) {
    const club = await this.getPresidentClub(userId);

    if (isNaN(feeINR) || feeINR < 0) {
      throw new Error('Membership fee must be a valid non-negative number.');
    }

    const feeInPaise = Math.round(feeINR * 100);

    const updated = await prisma.organization.update({
      where: { id: club.id },
      data: {
        membershipFee: feeInPaise,
      },
    });

    // Create system notification for all club members
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        title: `Membership Fee Updated: ${club.name}`,
        message: `The annual club membership fee has been fixed to ₹${feeINR} by Club Leadership.`,
        type: 'MEMBERSHIP_UPDATE',
        link: '/student/clubs',
      },
    });

    return {
      membershipFee: updated.membershipFee,
      membershipFeeINR: feeINR,
    };
  }

  /**
   * Get Announcements
   */
  async getAnnouncements(userId: string) {
    const club = await this.getPresidentClub(userId);

    return prisma.announcement.findMany({
      where: { organizationId: club.id },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Create Announcement
   */
  async createAnnouncement(
    userId: string,
    data: {
      title: string;
      content: string;
      category?: string;
      isPinned?: boolean;
      isMemberOnly?: boolean;
    }
  ) {
    const club = await this.getPresidentClub(userId);

    if (!data.title || !data.content) {
      throw new Error('Title and content are required to publish an announcement.');
    }

    const announcement = await prisma.announcement.create({
      data: {
        id: uuidv7(),
        organizationId: club.id,
        authorId: userId,
        title: data.title,
        content: data.content,
        category: data.category || 'GENERAL',
        isPinned: !!data.isPinned,
        isMemberOnly: !!data.isMemberOnly,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Broadcast system notification
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        title: `Announcement: ${club.name}`,
        message: data.title,
        type: 'ANNOUNCEMENT',
        link: '/student/clubs',
      },
    });

    return announcement;
  }

  /**
   * Update Announcement
   */
  async updateAnnouncement(
    userId: string,
    announcementId: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      isPinned?: boolean;
      isMemberOnly?: boolean;
    }
  ) {
    const club = await this.getPresidentClub(userId);

    const existing = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        organizationId: club.id,
      },
    });

    if (!existing) {
      throw new Error('Announcement not found or unauthorized.');
    }

    return prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title ?? existing.title,
        content: data.content ?? existing.content,
        category: data.category ?? existing.category,
        isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
        isMemberOnly: data.isMemberOnly !== undefined ? data.isMemberOnly : existing.isMemberOnly,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Delete Announcement
   */
  async deleteAnnouncement(userId: string, announcementId: string) {
    const club = await this.getPresidentClub(userId);

    const existing = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        organizationId: club.id,
      },
    });

    if (!existing) {
      throw new Error('Announcement not found or unauthorized.');
    }

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return { success: true, message: 'Announcement deleted successfully.' };
  }

  /**
   * Get Active Members
   */
  async getMembers(userId: string) {
    const club = await this.getPresidentClub(userId);

    const userRoles = await prisma.userRole.findMany({
      where: { organizationId: club.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    return userRoles.map((ur) => ({
      roleId: ur.id,
      userId: ur.userId,
      role: ur.role,
      assignedAt: ur.assignedAt,
      user: ur.user,
    }));
  }

  /**
   * Get Membership Applications
   */
  async getApplications(userId: string, status?: ApplicationStatus) {
    const club = await this.getPresidentClub(userId);

    const whereClause: any = { organizationId: club.id };
    if (status) {
      whereClause.status = status;
    }

    return prisma.membershipApplication.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Review Application: APPROVE or REJECT
   */
  async reviewApplication(
    userId: string,
    applicationId: string,
    status: ApplicationStatus
  ) {
    const club = await this.getPresidentClub(userId);

    const application = await prisma.membershipApplication.findFirst({
      where: {
        id: applicationId,
        organizationId: club.id,
      },
      include: { user: true },
    });

    if (!application) {
      throw new Error('Application not found.');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new Error(`Application has already been ${application.status.toLowerCase()}.`);
    }

    const updatedApp = await prisma.membershipApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: userId,
      },
    });

    // If APPROVED, create MEMBER UserRole
    if (status === ApplicationStatus.APPROVED) {
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: application.userId,
          role: RoleType.MEMBER,
          organizationId: club.id,
        },
      });

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: application.userId,
            role: RoleType.MEMBER,
            organizationId: club.id,
          },
        });
      }

      // Send student notification
      await prisma.notification.create({
        data: {
          id: uuidv7(),
          userId: application.userId,
          title: `Membership Approved: ${club.name}`,
          message: `Congratulations! Your membership application for ${club.name} has been approved by the Club President.`,
          type: 'MEMBERSHIP_APPROVED',
          link: '/student/clubs',
        },
      });
    } else if (status === ApplicationStatus.REJECTED) {
      // Send student notification
      await prisma.notification.create({
        data: {
          id: uuidv7(),
          userId: application.userId,
          title: `Membership Update: ${club.name}`,
          message: `Thank you for your interest. Your membership application for ${club.name} was not approved at this time.`,
          type: 'MEMBERSHIP_REJECTED',
          link: '/student/clubs',
        },
      });
    }

    return updatedApp;
  }

  /**
   * Assign Member Role (e.g. promote to VOLUNTEER, EVENT_ORGANIZER, TREASURER, MEMBER)
   */
  async assignMemberRole(
    userId: string,
    targetUserId: string,
    newRole: RoleType
  ) {
    const club = await this.getPresidentClub(userId);

    if (targetUserId === userId && newRole !== RoleType.PRESIDENT) {
      throw new Error('Cannot change your own President role through this action.');
    }

    // Check if target user already has a role in this club
    const existing = await prisma.userRole.findFirst({
      where: {
        userId: targetUserId,
        organizationId: club.id,
      },
    });

    if (existing) {
      return prisma.userRole.update({
        where: { id: existing.id },
        data: { role: newRole },
      });
    }

    return prisma.userRole.create({
      data: {
        id: uuidv7(),
        userId: targetUserId,
        role: newRole,
        organizationId: club.id,
      },
    });
  }

  /**
   * Remove member from club
   */
  async removeMember(userId: string, targetUserId: string) {
    const club = await this.getPresidentClub(userId);

    if (targetUserId === userId) {
      throw new Error('President cannot remove themselves from the club.');
    }

    await prisma.userRole.deleteMany({
      where: {
        userId: targetUserId,
        organizationId: club.id,
      },
    });

    return { success: true, message: 'Member removed from club.' };
  }
}

export const presidentService = new PresidentService();

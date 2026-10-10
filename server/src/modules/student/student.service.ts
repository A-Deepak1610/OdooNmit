import { PrismaClient, CandidateStatus, ApplicationStatus, ElectionStatus } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

export class StudentService {
  /**
   * 1. Get all notifications for student (targeted + global broadcasts)
   */
  async getNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        OR: [{ userId }, { userId: null }],
        isRead: false,
      },
    });

    return { notifications, unreadCount };
  }

  /**
   * 2. Mark single notification as read
   */
  async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found.');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * 3. Mark all notifications as read
   */
  async markAllNotificationsAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        OR: [{ userId }, { userId: null }],
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  /**
   * 4. Get active clubs with student's membership & application status
   */
  async getClubs(userId: string) {
    const [clubs, userRoles, applications] = await Promise.all([
      prisma.organization.findMany({
        where: { isActive: true },
        include: {
          userRoles: {
            where: { role: 'PRESIDENT' },
            include: {
              user: {
                select: { id: true, fullName: true, username: true, avatarUrl: true },
              },
            },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.userRole.findMany({
        where: { userId },
      }),
      prisma.membershipApplication.findMany({
        where: { userId },
      }),
    ]);

    const memberOrgIds = new Set(
      userRoles.filter((r) => r.organizationId).map((r) => r.organizationId as string)
    );

    const appMap = new Map(
      applications.map((app) => [app.organizationId, app])
    );

    return clubs.map((club) => {
      const isMember = memberOrgIds.has(club.id);
      const app = appMap.get(club.id);

      return {
        id: club.id,
        name: club.name,
        slug: club.slug,
        description: club.description,
        category: club.category,
        logoUrl: club.logoUrl,
        coverUrl: club.coverUrl,
        president: club.userRoles[0]?.user || null,
        isMember,
        applicationStatus: app ? app.status : null,
        application: app || null,
      };
    });
  }

  /**
   * 5. Apply for club membership
   */
  async applyForMembership(
    userId: string,
    organizationId: string,
    data: {
      statementOfPurpose?: string;
      experience?: string;
      department?: string;
      semester?: string;
    }
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new Error('Organization not found.');
    }

    // Check existing application
    const existing = await prisma.membershipApplication.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (existing) {
      if (existing.status === ApplicationStatus.PENDING) {
        throw new Error('You already have a pending application for this club.');
      }
      if (existing.status === ApplicationStatus.APPROVED) {
        throw new Error('You are already an approved member of this club.');
      }
      // If previously rejected, allow re-applying
      return prisma.membershipApplication.update({
        where: { id: existing.id },
        data: {
          statementOfPurpose: data.statementOfPurpose || '',
          experience: data.experience || '',
          department: data.department || '',
          semester: data.semester || '',
          status: ApplicationStatus.PENDING,
          updatedAt: new Date(),
        },
      });
    }

    const application = await prisma.membershipApplication.create({
      data: {
        id: uuidv7(),
        userId,
        organizationId,
        statementOfPurpose: data.statementOfPurpose || '',
        experience: data.experience || '',
        department: data.department || '',
        semester: data.semester || '',
        status: ApplicationStatus.PENDING,
      },
      include: {
        organization: { select: { name: true } },
        user: { select: { fullName: true } },
      },
    });

    // Notify Super Admin & Organization
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        userId: null, // Broadcast to admin
        title: `New Membership Application: ${application.user.fullName}`,
        message: `${application.user.fullName} applied to join ${application.organization.name}. Review application details and statement of purpose.`,
        type: 'MEMBERSHIP_APPLICATION',
      },
    });

    return application;
  }

  /**
   * 6. Get elections open for voting or nominations, including student vote state
   */
  async getElections(userId: string) {
    const elections = await prisma.election.findMany({
      where: {
        status: { in: [ElectionStatus.NOMINATION_OPEN, ElectionStatus.VOTING_OPEN, ElectionStatus.COMPLETED] },
      },
      include: {
        organization: {
          select: { id: true, name: true, logoUrl: true, category: true },
        },
        candidates: {
          include: {
            user: {
              select: { id: true, fullName: true, username: true, avatarUrl: true },
            },
          },
        },
        votes: {
          where: { voterId: userId },
          select: { candidateId: true, castAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return elections.map((elec) => {
      const userVote = elec.votes[0] || null;
      const myCandidate = elec.candidates.find((c) => c.userId === userId) || null;

      // Filter visible candidates:
      // In voting or completed: show APPROVED candidates
      // Also always include user's own candidate status so they see approval state
      const visibleCandidates = elec.candidates.filter(
        (c) => c.status === CandidateStatus.APPROVED || c.userId === userId
      );

      return {
        id: elec.id,
        title: elec.title,
        academicYear: elec.academicYear,
        description: elec.description,
        status: elec.status,
        nominationDeadline: elec.nominationDeadline,
        votingStartDate: elec.votingStartDate,
        votingEndDate: elec.votingEndDate,
        organization: elec.organization,
        candidates: visibleCandidates,
        hasVoted: Boolean(userVote),
        votedCandidateId: userVote ? userVote.candidateId : null,
        myNomination: myCandidate,
      };
    });
  }

  /**
   * 7. Apply for Club President / Election Nomination based on Election Notice
   */
  async applyForNomination(
    userId: string,
    electionId: string,
    data: {
      statementOfPurpose: string;
      experience: string;
      manifesto: string;
    }
  ) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { organization: true },
    });

    if (!election) {
      throw new Error('Election not found.');
    }

    if (election.status !== ElectionStatus.NOMINATION_OPEN && election.status !== ElectionStatus.DRAFT) {
      throw new Error(`Nominations are currently ${election.status.replace('_', ' ').toLowerCase()}.`);
    }

    // Check if nomination deadline passed
    if (new Date() > new Date(election.nominationDeadline)) {
      throw new Error('The nomination deadline for this election has closed.');
    }

    const existing = await prisma.electionCandidate.findUnique({
      where: {
        electionId_userId: {
          electionId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error(`You have already submitted a nomination for this election (Status: ${existing.status}).`);
    }

    const candidate = await prisma.electionCandidate.create({
      data: {
        id: uuidv7(),
        electionId,
        userId,
        manifesto: data.manifesto || '',
        statementOfPurpose: data.statementOfPurpose || '',
        experience: data.experience || '',
        status: CandidateStatus.PENDING,
      },
      include: {
        user: { select: { fullName: true, username: true } },
        election: { include: { organization: true } },
      },
    });

    // Notify Super Admin immediately
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        userId: null, // Platform admin notification
        title: `Election Nomination: ${candidate.user.fullName}`,
        message: `${candidate.user.fullName} nominated for President of ${candidate.election.organization.name}. Experience & Statement of Purpose submitted for review.`,
        type: 'ELECTION_NOMINATION',
      },
    });

    return candidate;
  }

  /**
   * 8. Cast Atomic 1-Time Ballot
   */
  async castVote(userId: string, electionId: string, candidateId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new Error('Election not found.');
    }

    if (election.status !== ElectionStatus.VOTING_OPEN) {
      throw new Error('Voting is not currently active for this election.');
    }

    // Verify candidate is approved and belongs to this election
    const candidate = await prisma.electionCandidate.findFirst({
      where: {
        id: candidateId,
        electionId,
        status: CandidateStatus.APPROVED,
      },
    });

    if (!candidate) {
      throw new Error('Candidate not found or nomination has not been approved.');
    }

    // Execute atomic 1-time ballot
    return prisma.$transaction(async (tx) => {
      // Check existing vote
      const existingVote = await tx.electionVote.findUnique({
        where: {
          electionId_voterId: {
            electionId,
            voterId: userId,
          },
        },
      });

      if (existingVote) {
        throw new Error('Ballot already cast. Each student is permitted strictly one vote per election.');
      }

      // Record vote
      const vote = await tx.electionVote.create({
        data: {
          id: uuidv7(),
          electionId,
          candidateId,
          voterId: userId,
        },
      });

      // Increment vote count atomically
      await tx.electionCandidate.update({
        where: { id: candidateId },
        data: { voteCount: { increment: 1 } },
      });

      return vote;
    });
  }
}

export const studentService = new StudentService();

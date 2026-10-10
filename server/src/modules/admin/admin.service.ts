import {
  RoleType,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  ElectionStatus,
  CandidateStatus,
} from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { generateId } from '../../common/utils/id.util.js';

export class AdminService {
  /**
   * 1. Dashboard Overview Metrics
   */
  async getDashboardOverview() {
    const [
      totalClubs,
      activeClubs,
      totalUsers,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      totalElections,
      activeElections,
      recentTickets,
      recentNotifications,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: TicketStatus.OPEN } }),
      prisma.supportTicket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
      prisma.supportTicket.count({ where: { status: TicketStatus.RESOLVED } }),
      prisma.election.count(),
      prisma.election.count({
        where: {
          OR: [
            { status: ElectionStatus.VOTING_OPEN },
            { status: ElectionStatus.NOMINATION_OPEN },
          ],
        },
      }),
      prisma.supportTicket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { fullName: true, username: true, email: true } },
          organization: { select: { name: true, slug: true } },
        },
      }),
      prisma.notification.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Role breakdown
    const roleCounts = await prisma.userRole.groupBy({
      by: ['role'],
      _count: { userId: true },
    });

    const roleDistribution = roleCounts.reduce((acc, r) => {
      acc[r.role] = r._count.userId;
      return acc;
    }, {} as Record<string, number>);

    return {
      kpis: {
        totalClubs,
        activeClubs,
        inactiveClubs: totalClubs - activeClubs,
        totalUsers,
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        totalElections,
        activeElections,
      },
      roleDistribution,
      recentTickets,
      recentNotifications,
    };
  }

  /**
   * 2. Clubs / Organizations Management
   */
  async getClubs(query?: { search?: string; status?: string; category?: string }) {
    const where: any = {};

    if (query?.status === 'active') where.isActive = true;
    if (query?.status === 'inactive') where.isActive = false;
    if (query?.category) where.category = query.category;

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search } },
        { slug: { contains: query.search } },
        { description: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    const clubs = await prisma.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            userRoles: true,
            supportTickets: true,
            elections: true,
          },
        },
      },
    });

    return clubs.map((c) => {
      const presidentRole = c.userRoles.find((ur) => ur.role === RoleType.PRESIDENT);
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        category: c.category || 'General',
        logoUrl: c.logoUrl,
        coverUrl: c.coverUrl,
        websiteUrl: c.websiteUrl,
        instagramUrl: c.instagramUrl,
        linkedinUrl: c.linkedinUrl,
        membershipFee: c.membershipFee,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        memberCount: c._count.userRoles,
        ticketCount: c._count.supportTickets,
        electionCount: c._count.elections,
        president: presidentRole?.user || null,
      };
    });
  }

  async createClub(data: {
    name: string;
    slug?: string;
    category?: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    membershipFee?: number;
    websiteUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
  }) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`A club with slug "${slug}" already exists.`);
    }

    return prisma.organization.create({
      data: {
        id: generateId(),
        name: data.name,
        slug,
        category: data.category || 'Special Interest',
        description: data.description,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        membershipFee: data.membershipFee !== undefined ? Number(data.membershipFee) : 50000,
        websiteUrl: data.websiteUrl,
        instagramUrl: data.instagramUrl,
        linkedinUrl: data.linkedinUrl,
        isActive: true,
      },
    });
  }

  async updateClub(clubId: string, data: {
    name?: string;
    category?: string;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    membershipFee?: number;
    websiteUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    isActive?: boolean;
  }) {
    const existing = await prisma.organization.findUnique({ where: { id: clubId } });
    if (!existing) {
      throw new Error('Club not found.');
    }

    return prisma.organization.update({
      where: { id: clubId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.membershipFee !== undefined && { membershipFee: Number(data.membershipFee) }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.instagramUrl !== undefined && { instagramUrl: data.instagramUrl }),
        ...(data.linkedinUrl !== undefined && { linkedinUrl: data.linkedinUrl }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      },
    });
  }

  async updateClubStatus(clubId: string, isActive: boolean) {
    return prisma.organization.update({
      where: { id: clubId },
      data: { isActive },
    });
  }

  async assignClubPresident(clubId: string, userId: string | null) {
    const club = await prisma.organization.findUnique({ where: { id: clubId } });
    if (!club) throw new Error('Club not found.');

    if (!userId) {
      await prisma.userRole.deleteMany({
        where: { organizationId: clubId, role: RoleType.PRESIDENT },
      });
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    // Remove existing president for this club
    await prisma.userRole.deleteMany({
      where: { organizationId: clubId, role: RoleType.PRESIDENT },
    });

    // Ensure user has Member role for this club
    const hasMemberRole = await prisma.userRole.findFirst({
      where: { userId, organizationId: clubId, role: RoleType.MEMBER },
    });

    if (!hasMemberRole) {
      await prisma.userRole.create({
        data: {
          id: generateId(),
          userId,
          role: RoleType.MEMBER,
          organizationId: clubId,
        },
      });
    }

    // Assign PRESIDENT role
    const newPresidentRole = await prisma.userRole.create({
      data: {
        id: generateId(),
        userId,
        role: RoleType.PRESIDENT,
        organizationId: clubId,
      },
      include: {
        user: { select: { id: true, fullName: true, username: true, email: true, avatarUrl: true } },
      },
    });

    // Create system notification
    await prisma.notification.create({
      data: {
        id: generateId(),
        title: `Leadership Assigned: ${club.name}`,
        message: `${user.fullName} (${user.username}) has been appointed as President of ${club.name}.`,
        type: 'CLUB_UPDATE',
        link: '/admin/clubs',
      },
    });

    return newPresidentRole;
  }

  /**
   * 3. Support Tickets & Messaging
   */
  async getTickets(query?: { status?: string; category?: string; priority?: string; search?: string }) {
    const where: any = {};

    if (query?.status && query.status !== 'ALL') where.status = query.status as TicketStatus;
    if (query?.category && query.category !== 'ALL') where.category = query.category as TicketCategory;
    if (query?.priority && query.priority !== 'ALL') where.priority = query.priority as TicketPriority;

    if (query?.search) {
      where.OR = [
        { ticketNumber: { contains: query.search } },
        { subject: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    return prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, fullName: true, username: true, email: true, avatarUrl: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async getTicketDetails(ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: { id: true, fullName: true, username: true, email: true, avatarUrl: true },
        },
        assignedTo: {
          select: { id: true, fullName: true, username: true, email: true },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, fullName: true, username: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!ticket) throw new Error('Support ticket not found.');
    return ticket;
  }

  async replyToTicket(ticketId: string, adminId: string, message: string, newStatus?: TicketStatus) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error('Ticket not found.');

    const supportMsg = await prisma.supportMessage.create({
      data: {
        id: generateId(),
        ticketId,
        senderId: adminId,
        message,
        isAdminReply: true,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true, avatarUrl: true },
        },
      },
    });

    // Update ticket status
    const updateData: any = {};
    if (newStatus) {
      updateData.status = newStatus;
      if (newStatus === TicketStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      }
    } else if (ticket.status === TicketStatus.OPEN) {
      updateData.status = TicketStatus.IN_PROGRESS;
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Create user notification for ticket reply
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: ticket.createdById,
        title: `Reply on Ticket #${ticket.ticketNumber}`,
        message: `Admin replied: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
        type: 'SUPPORT_TICKET',
        link: '/tickets',
      },
    });

    return supportMsg;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const updateData: any = { status };
    if (status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    }

    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });
  }

  /**
   * 4. Election Management & Atomic One-Time Voting
   */
  async getElections() {
    return prisma.election.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
        candidates: {
          include: {
            user: { select: { id: true, fullName: true, username: true, email: true, avatarUrl: true } },
          },
          orderBy: { voteCount: 'desc' },
        },
        _count: {
          select: { votes: true, candidates: true },
        },
      },
    });
  }

  async createElection(data: {
    title: string;
    organizationId: string;
    academicYear?: string;
    description?: string;
    nominationDeadline: string | Date;
    votingStartDate: string | Date;
    votingEndDate: string | Date;
  }) {
    const club = await prisma.organization.findUnique({ where: { id: data.organizationId } });
    if (!club) throw new Error('Club not found for election.');

    const election = await prisma.election.create({
      data: {
        id: generateId(),
        title: data.title,
        organizationId: data.organizationId,
        academicYear: data.academicYear || '2026-2027',
        description: data.description,
        status: ElectionStatus.NOMINATION_OPEN,
        nominationDeadline: new Date(data.nominationDeadline),
        votingStartDate: new Date(data.votingStartDate),
        votingEndDate: new Date(data.votingEndDate),
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    // Broadcast notification to all campus users
    await prisma.notification.create({
      data: {
        id: generateId(),
        title: `Election Announced: ${data.title}`,
        message: `Super Admin announced elections for ${club.name}. Nominations are open until ${new Date(data.nominationDeadline).toLocaleDateString()}.`,
        type: 'ELECTION_ANNOUNCED',
        link: '/elections',
      },
    });

    return election;
  }

  async updateElectionStatus(electionId: string, status: ElectionStatus) {
    return prisma.election.update({
      where: { id: electionId },
      data: { status },
    });
  }

  async applyNomination(electionId: string, userId: string, manifesto: string) {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) throw new Error('Election not found.');

    if (election.status !== ElectionStatus.NOMINATION_OPEN && election.status !== ElectionStatus.DRAFT) {
      throw new Error('Nominations are closed for this election.');
    }

    const existing = await prisma.electionCandidate.findUnique({
      where: { electionId_userId: { electionId, userId } },
    });

    if (existing) {
      throw new Error('You have already submitted a nomination application for this election.');
    }

    return prisma.electionCandidate.create({
      data: {
        id: generateId(),
        electionId,
        userId,
        manifesto,
        status: CandidateStatus.PENDING,
      },
      include: {
        user: { select: { fullName: true, username: true } },
      },
    });
  }

  async updateCandidateStatus(candidateId: string, status: CandidateStatus) {
    const candidate = await prisma.electionCandidate.update({
      where: { id: candidateId },
      data: {
        status,
        approvedAt: status === CandidateStatus.APPROVED ? new Date() : null,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        election: { select: { title: true } },
      },
    });

    // Notify student of nomination status
    await prisma.notification.create({
      data: {
        id: generateId(),
        userId: candidate.userId,
        title: `Nomination ${status === CandidateStatus.APPROVED ? 'Approved' : 'Rejected'}`,
        message: `Your candidacy application for "${candidate.election.title}" has been ${status.toLowerCase()} by the Administrator.`,
        type: 'ELECTION_ANNOUNCED',
        link: '/elections',
      },
    });

    return candidate;
  }

  /**
   * Atomic, Idempotent 1-Time Voting per User
   */
  async castVote(electionId: string, voterId: string, candidateId: string) {
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) throw new Error('Election not found.');

    if (election.status !== ElectionStatus.VOTING_OPEN) {
      throw new Error('Voting is currently not open for this election.');
    }

    const now = new Date();
    if (now < election.votingStartDate || now > election.votingEndDate) {
      throw new Error('Voting period is inactive. Ballots cannot be submitted.');
    }

    const candidate = await prisma.electionCandidate.findFirst({
      where: { id: candidateId, electionId, status: CandidateStatus.APPROVED },
    });

    if (!candidate) {
      throw new Error('Invalid or unapproved candidate selected.');
    }

    // Atomic transaction enforcing unique [electionId, voterId]
    return prisma.$transaction(async (tx) => {
      // Check existing vote
      const existingVote = await tx.electionVote.findUnique({
        where: { electionId_voterId: { electionId, voterId } },
      });

      if (existingVote) {
        throw new Error('Duplicate vote rejected. You have already cast your ballot in this election.');
      }

      // Record vote
      const vote = await tx.electionVote.create({
        data: {
          id: generateId(),
          electionId,
          candidateId,
          voterId,
        },
      });

      // Increment candidate vote tally
      await tx.electionCandidate.update({
        where: { id: candidateId },
        data: { voteCount: { increment: 1 } },
      });

      return {
        success: true,
        ballotId: vote.id,
        castAt: vote.castAt,
        message: 'Ballot verified and recorded successfully.',
      };
    });
  }

  /**
   * Finalize Election: Tally votes, declare winner, send broadcast, and promote winner to PRESIDENT!
   */
  async finalizeElection(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        organization: true,
        candidates: {
          where: { status: CandidateStatus.APPROVED },
          orderBy: { voteCount: 'desc' },
          include: {
            user: { select: { id: true, fullName: true, username: true } },
          },
        },
      },
    });

    if (!election) throw new Error('Election not found.');
    if (election.status === ElectionStatus.COMPLETED) {
      throw new Error('Election has already been completed.');
    }

    const topCandidate = election.candidates[0];
    if (!topCandidate) {
      throw new Error('No approved candidates found to finalize.');
    }

    const winnerUser = topCandidate.user;

    // 1. Mark election completed with winner
    await prisma.election.update({
      where: { id: electionId },
      data: {
        status: ElectionStatus.COMPLETED,
        winnerCandidateId: winnerUser.id,
      },
    });

    // 2. Automatically promote winner to PRESIDENT of the club!
    // Remove old president for this club
    await prisma.userRole.deleteMany({
      where: { organizationId: election.organizationId, role: RoleType.PRESIDENT },
    });

    // Ensure winner has MEMBER role
    const hasMember = await prisma.userRole.findFirst({
      where: {
        userId: winnerUser.id,
        organizationId: election.organizationId,
        role: RoleType.MEMBER,
      },
    });

    if (!hasMember) {
      await prisma.userRole.create({
        data: {
          id: generateId(),
          userId: winnerUser.id,
          role: RoleType.MEMBER,
          organizationId: election.organizationId,
        },
      });
    }

    // Create PRESIDENT role
    await prisma.userRole.create({
      data: {
        id: generateId(),
        userId: winnerUser.id,
        role: RoleType.PRESIDENT,
        organizationId: election.organizationId,
      },
    });

    // 3. Broadcast winner notification to all users
    await prisma.notification.create({
      data: {
        id: generateId(),
        title: `🏆 Election Results: ${election.organization.name}`,
        message: `Official Results: ${winnerUser.fullName} has won the election with ${topCandidate.voteCount} vote(s) and is promoted to President of ${election.organization.name}!`,
        type: 'ELECTION_RESULT',
        link: '/elections',
      },
    });

    return {
      success: true,
      winner: winnerUser,
      voteCount: topCandidate.voteCount,
      organization: election.organization.name,
    };
  }

  /**
   * 5. Natural Language DB Assistant Query Processor (Powered by TiDB Cloud RAG SQL Chatbot)
   */
  async processDbAssistantQuery(queryText: string) {
    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: queryText.trim() }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new Error(errorData.detail || `SQL Chatbot returned HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        question: string;
        sql: string;
        answer: string;
        results: Array<Record<string, any>>;
      };

      const results = data.results || [];
      const columns = results.length > 0 ? Object.keys(results[0]) : ['Status'];
      const rows =
        results.length > 0
          ? results.map((row) => columns.map((col) => String(row[col] ?? '')))
          : [['No matching records returned']];

      return {
        query: data.question,
        interpretedIntent: data.answer,
        sqlQuery: data.sql,
        summaryMetrics: [
          { label: 'Rows Returned', value: `${results.length}` },
          { label: 'Database', value: 'TiDB Cloud MySQL' },
          { label: 'LLM Engine', value: 'openai/gpt-oss-20b' },
        ],
        columns,
        rows,
        rawResults: results,
      };
    } catch (err: any) {
      console.warn(`[SQL Bot Client] Proxy fallback: ${err.message}`);
      // Fallback for simple club query if python service temporarily starting
      const clubs = await prisma.organization.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      return {
        query: queryText,
        interpretedIntent: `Error communicating with SQL Bot: ${err.message}. Showing cached organization records.`,
        sqlQuery: 'SELECT id, name, category, isActive FROM organizations LIMIT 10;',
        summaryMetrics: [
          { label: 'Fallback Rows', value: `${clubs.length}` },
          { label: 'Status', value: 'Fallback Mode' },
          { label: 'Port', value: '8001' },
        ],
        columns: ['Club Name', 'Category', 'Status'],
        rows: clubs.map((c) => [c.name, c.category || 'General', c.isActive ? 'ACTIVE' : 'INACTIVE']),
      };
    }
  }
}

export const adminService = new AdminService();

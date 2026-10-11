import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { generateId } from '../../common/utils/id.util.js';

export class SupportService {
  /**
   * 1. Get Tickets based on role and filters
   * - Super Admin: views all tickets
   * - Club Leader (President): views tickets for their club + their own tickets
   * - Other roles (Student, Member, Volunteer, etc.): views tickets created by them
   */
  async getTickets(
    userId: string,
    filters?: {
      status?: string;
      category?: string;
      priority?: string;
      organizationId?: string;
      search?: string;
    }
  ) {
    const userRoles = await prisma.userRole.findMany({ where: { userId } });
    const isAdmin = userRoles.some((r) => r.role === 'ADMIN');
    const presidentRoles = userRoles.filter((r) => r.role === 'PRESIDENT');
    const presidentOrgIds = presidentRoles
      .map((r) => r.organizationId)
      .filter(Boolean) as string[];

    const where: any = {};

    if (isAdmin) {
      // Super Admin can view all tickets, optionally filtered by organizationId
      if (filters?.organizationId) {
        where.organizationId = filters.organizationId;
      }
    } else if (presidentOrgIds.length > 0) {
      // Club President can view club queries tied to their organization OR tickets they created
      where.OR = [
        { organizationId: { in: presidentOrgIds } },
        { createdById: userId },
      ];
      if (filters?.organizationId && presidentOrgIds.includes(filters.organizationId)) {
        where.organizationId = filters.organizationId;
      }
    } else {
      // Members, Students, Volunteers, Treasurers, Organizers can view their own created tickets
      where.createdById = userId;
    }

    if (filters?.status && Object.values(TicketStatus).includes(filters.status as TicketStatus)) {
      where.status = filters.status as TicketStatus;
    }

    if (filters?.category && Object.values(TicketCategory).includes(filters.category as TicketCategory)) {
      where.category = filters.category as TicketCategory;
    }

    if (filters?.priority && Object.values(TicketPriority).includes(filters.priority as TicketPriority)) {
      where.priority = filters.priority as TicketPriority;
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const searchClause = [
        { ticketNumber: { contains: filters.search.trim() } },
        { subject: { contains: filters.search.trim() } },
        { description: { contains: filters.search.trim() } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchClause }];
        delete where.OR;
      } else {
        where.OR = searchClause;
      }
    }

    return prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, fullName: true, username: true, email: true, avatarUrl: true },
        },
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * 2. Create Ticket / Query
   * Reflects to Super Admin, and also to Club Leader if organizationId is provided
   */
  async createTicket(
    userId: string,
    data: {
      subject: string;
      description: string;
      category?: string;
      priority?: string;
      organizationId?: string | null;
    }
  ) {
    if (!data.subject?.trim() || !data.description?.trim()) {
      throw new Error('Subject and description are required to submit a query.');
    }

    const validCategory = Object.values(TicketCategory).includes(data.category as TicketCategory)
      ? (data.category as TicketCategory)
      : TicketCategory.GENERAL;

    const validPriority = Object.values(TicketPriority).includes(data.priority as TicketPriority)
      ? (data.priority as TicketPriority)
      : TicketPriority.MEDIUM;

    let orgId: string | null = null;
    if (data.organizationId?.trim()) {
      const org = await prisma.organization.findUnique({
        where: { id: data.organizationId.trim() },
        select: { id: true, name: true },
      });
      if (org) orgId = org.id;
    }

    // Generate unique sequential ticket number
    const count = await prisma.supportTicket.count();
    let ticketNumber = `TICK-${1000 + count + 1}`;
    const exists = await prisma.supportTicket.findUnique({ where: { ticketNumber } });
    if (exists) {
      ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        id: generateId(),
        ticketNumber,
        subject: data.subject.trim(),
        description: data.description.trim(),
        category: validCategory,
        priority: validPriority,
        status: TicketStatus.OPEN,
        organizationId: orgId,
        createdById: userId,
      },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        createdBy: {
          select: { id: true, fullName: true, username: true, email: true, avatarUrl: true },
        },
      },
    });

    // Create initial message in thread
    await prisma.supportMessage.create({
      data: {
        id: generateId(),
        ticketId: ticket.id,
        senderId: userId,
        message: data.description.trim(),
        isAdminReply: false,
      },
    });

    // Notify Super Admins
    const adminRoles = await prisma.userRole.findMany({
      where: { role: 'ADMIN' },
      select: { userId: true },
    });
    for (const admin of adminRoles) {
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: admin.userId,
          title: `New ${orgId ? 'Club Query' : 'Platform Query'} #${ticket.ticketNumber}`,
          message: `${ticket.createdBy.fullName}: "${ticket.subject}"`,
          type: 'SUPPORT_TICKET',
          link: '/admin/tickets',
        },
      });
    }

    // If query is tied to a club, ALSO notify the Club Leader (President)
    if (orgId) {
      const clubPresident = await prisma.userRole.findFirst({
        where: { organizationId: orgId, role: 'PRESIDENT' },
        select: { userId: true },
      });
      if (clubPresident?.userId && clubPresident.userId !== userId) {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: clubPresident.userId,
            title: `New Club Query #${ticket.ticketNumber}`,
            message: `${ticket.createdBy.fullName}: "${ticket.subject}"`,
            type: 'SUPPORT_TICKET',
            link: '/president/support',
          },
        });
      }
    }

    return ticket;
  }

  /**
   * 3. Get Ticket Details & Conversation Messages
   */
  async getTicketDetails(userId: string, ticketId: string) {
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
          select: { id: true, name: true, slug: true, logoUrl: true },
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

    if (!ticket) throw new Error('Support query not found.');

    // Security check: must be Admin, President of club, or Creator
    const userRoles = await prisma.userRole.findMany({ where: { userId } });
    const isAdmin = userRoles.some((r) => r.role === 'ADMIN');
    const isClubPresident =
      ticket.organizationId &&
      userRoles.some((r) => r.role === 'PRESIDENT' && r.organizationId === ticket.organizationId);
    const isCreator = ticket.createdById === userId;

    if (!isAdmin && !isClubPresident && !isCreator) {
      throw new Error('Access denied: You do not have permission to view this query.');
    }

    return ticket;
  }

  /**
   * 4. Reply to Ticket
   * Handles replies from Super Admin, Club President, or the User
   */
  async replyToTicket(
    userId: string,
    ticketId: string,
    message: string,
    newStatus?: TicketStatus
  ) {
    if (!message?.trim()) {
      throw new Error('Reply message cannot be empty.');
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        organization: { select: { id: true, name: true } },
      },
    });
    if (!ticket) throw new Error('Query not found.');

    const userRoles = await prisma.userRole.findMany({ where: { userId } });
    const isAdmin = userRoles.some((r) => r.role === 'ADMIN');
    const isClubPresident =
      !!ticket.organizationId &&
      userRoles.some((r) => r.role === 'PRESIDENT' && r.organizationId === ticket.organizationId);
    const isCreator = ticket.createdById === userId;

    if (!isAdmin && !isClubPresident && !isCreator) {
      throw new Error('Access denied: You cannot reply to this query.');
    }

    const isAdminReply = isAdmin || !!isClubPresident;

    const supportMsg = await prisma.supportMessage.create({
      data: {
        id: generateId(),
        ticketId,
        senderId: userId,
        message: message.trim(),
        isAdminReply,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true, avatarUrl: true },
        },
      },
    });

    // Update status if provided or advance to IN_PROGRESS when leadership replies
    const updateData: any = {};
    if (newStatus && (isAdmin || isClubPresident)) {
      updateData.status = newStatus;
      if (newStatus === TicketStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      }
    } else if (isAdminReply && ticket.status === TicketStatus.OPEN) {
      updateData.status = TicketStatus.IN_PROGRESS;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
      });
    }

    // Sender info for notifications
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });
    const senderName = sender?.fullName || (isAdmin ? 'Admin' : isClubPresident ? 'Club Leader' : 'User');

    // If Leadership replied, notify creator
    if (isAdminReply && ticket.createdById !== userId) {
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: ticket.createdById,
          title: `Reply on Query #${ticket.ticketNumber}`,
          message: `${senderName}: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
          type: 'SUPPORT_TICKET',
          link: '/student/support',
        },
      });
    }

    // If Creator replied, notify Admins and Club President
    if (isCreator) {
      const adminRoles = await prisma.userRole.findMany({
        where: { role: 'ADMIN' },
        select: { userId: true },
      });
      for (const admin of adminRoles) {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: admin.userId,
            title: `Update on Query #${ticket.ticketNumber}`,
            message: `${senderName}: "${message.slice(0, 80)}"`,
            type: 'SUPPORT_TICKET',
            link: '/admin/tickets',
          },
        });
      }

      if (ticket.organizationId) {
        const president = await prisma.userRole.findFirst({
          where: { organizationId: ticket.organizationId, role: 'PRESIDENT' },
          select: { userId: true },
        });
        if (president?.userId) {
          await prisma.notification.create({
            data: {
              id: generateId(),
              userId: president.userId,
              title: `Update on Query #${ticket.ticketNumber}`,
              message: `${senderName}: "${message.slice(0, 80)}"`,
              type: 'SUPPORT_TICKET',
              link: '/president/support',
            },
          });
        }
      }
    }

    return supportMsg;
  }

  /**
   * 5. Update Ticket Status
   */
  async updateTicketStatus(userId: string, ticketId: string, status: TicketStatus) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new Error('Query not found.');

    const userRoles = await prisma.userRole.findMany({ where: { userId } });
    const isAdmin = userRoles.some((r) => r.role === 'ADMIN');
    const isClubPresident =
      !!ticket.organizationId &&
      userRoles.some((r) => r.role === 'PRESIDENT' && r.organizationId === ticket.organizationId);
    const isCreator = ticket.createdById === userId;

    if (!isAdmin && !isClubPresident && !isCreator) {
      throw new Error('Access denied: You cannot change the status of this query.');
    }

    const updateData: any = { status };
    if (status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    } else if (status === TicketStatus.OPEN) {
      updateData.resolvedAt = null;
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Notify creator if status changed by leadership
    if ((isAdmin || isClubPresident) && ticket.createdById !== userId) {
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: ticket.createdById,
          title: `Query #${ticket.ticketNumber} Marked ${status}`,
          message: `Your query has been marked as ${status}.`,
          type: 'SUPPORT_TICKET',
          link: '/student/support',
        },
      });
    }

    return updated;
  }
}

export const supportService = new SupportService();

import { PrismaClient, EventStatus, RoleType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';
import QRCode from 'qrcode';
import { ticketReservationService } from './ticket-reservation.service.js';
import { emailService } from '../../common/services/email.service.js';

const prisma = new PrismaClient();


export class EventService {
  /**
   * Get all events with optional filters (search, status, domain, organizationId)
   */
  async getEvents(params?: {
    search?: string;
    status?: string;
    domain?: string;
    category?: string;
    organizationId?: string;
    inchargeId?: string;
    postedDate?: string;
    sortBy?: string;
  }) {
    const where: any = {};

    if (params?.organizationId) {
      where.organizationId = params.organizationId;
    }

    if (params?.inchargeId) {
      where.inchargeId = params.inchargeId;
    }

    if (params?.status && params.status !== 'ALL') {
      if (params.status === 'ONGOING' || params.status === 'UPCOMING' || params.status === 'COMPLETED' || params.status === 'DRAFT') {
        where.status = params.status as EventStatus;
      }
    }

    if (params?.domain && params.domain !== 'ALL') {
      where.domain = params.domain;
    }

    if (params?.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    // Filter by Event Posted Date (createdAt)
    if (params?.postedDate && params.postedDate !== 'ALL') {
      const now = new Date();
      if (params.postedDate === 'TODAY') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        where.createdAt = { gte: startOfToday };
      } else if (params.postedDate === 'THIS_WEEK') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        where.createdAt = { gte: startOfWeek };
      } else if (params.postedDate === 'THIS_MONTH') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        where.createdAt = { gte: startOfMonth };
      } else if (params.postedDate === 'PAST_MONTH') {
        const startOfPastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        where.createdAt = { gte: startOfPastMonth };
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(params.postedDate)) {
        // Specific posted date YYYY-MM-DD
        const [y, m, d] = params.postedDate.split('-').map(Number);
        const dayStart = new Date(y, m - 1, d);
        const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
        where.createdAt = { gte: dayStart, lte: dayEnd };
      }
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q } },
        { domain: { contains: q } },
        { category: { contains: q } },
        { venue: { contains: q } },
        { description: { contains: q } },
      ];
    }

    // Sort order: default newest posted first
    let orderBy: any = { createdAt: 'desc' };
    if (params?.sortBy === 'createdAt_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (params?.sortBy === 'startAt_asc') {
      orderBy = { startAt: 'asc' };
    } else if (params?.sortBy === 'startAt_desc') {
      orderBy = { startAt: 'desc' };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        incharge: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            quantity: true,
            status: true,
            createdAt: true,
            checkedInAt: true,
          },
        },
      },
      orderBy,
    });

    return events.map((e) => {
      let parsedAnalytics: any = null;
      try {
        if (e.analyticsData) {
          parsedAnalytics = JSON.parse(e.analyticsData);
        }
      } catch {
        parsedAnalytics = null;
      }

      if (parsedAnalytics) {
        // Strip legacy static mock keys
        delete parsedAnalytics.avgTimeOnPage;
        delete parsedAnalytics.conversionRate;
        delete parsedAnalytics.locationsCount;
        delete parsedAnalytics.geographicDistribution;
        delete parsedAnalytics.domainDistribution;
        delete parsedAnalytics.registrationStatus;
        delete parsedAnalytics.departmentWise;
        delete parsedAnalytics.participatingColleges;
        delete parsedAnalytics.yearWise;
        delete parsedAnalytics.domainWinRates;
        delete parsedAnalytics.averageWinRate;

        // Calculate real registration trend from bookings
        if (e.bookings) {
          const activeBookings = (e.bookings || []).filter(
            (b: any) => b.status === 'RESERVED' || b.status === 'CONFIRMED' || b.checkedInAt != null
          );
          activeBookings.sort(
            (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          const trendMap = new Map<string, number>();
          let cum = 0;
          if (activeBookings.length === 0) {
            const createdDate = new Date(e.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            parsedAnalytics.registrationTrend = [{ date: createdDate, count: 0 }];
          } else {
            activeBookings.forEach((b: any) => {
              const d = new Date(b.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              cum += b.quantity || 1;
              trendMap.set(d, cum);
            });
            parsedAnalytics.registrationTrend = Array.from(trendMap.entries()).map(
              ([date, count]) => ({ date, count })
            );
          }
        }
      }

      // Compute display status badge
      const now = new Date();
      let displayStatus = 'UPCOMING';
      if (e.status === 'COMPLETED' || now > e.endAt) {
        displayStatus = 'COMPLETED';
      } else if (now >= e.startAt && now <= e.endAt) {
        displayStatus = 'ONGOING';
      } else {
        displayStatus = 'UPCOMING';
      }

      const checkedInCount = (e.bookings || []).filter((b: any) => b.checkedInAt !== null).length;
      const totalBookingsCount = (e.bookings || []).filter((b: any) => b.status === 'CONFIRMED' || b.status === 'RESERVED').length;

      return {
        ...e,
        checkedInCount,
        totalBookingsCount,
        displayStatus,
        memberPriceINR: (e.memberPrice / 100).toFixed(0),
        nonMemberPriceINR: (e.nonMemberPrice / 100).toFixed(0),
        analytics: parsedAnalytics,
      };
    });
  }

  /**
   * Get single event with analytics, incharge, tasks, and attendees
   */
  async getEventById(id: string, viewerUserId?: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organization: true,
        incharge: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    let parsedAnalytics: any = {};
    try {
      if (event.analyticsData) {
        parsedAnalytics = JSON.parse(event.analyticsData);
      }
    } catch {
      parsedAnalytics = {};
    }

    // Increment real page views
    const currentViews = (Number(parsedAnalytics.pageViews) || 0) + 1;
    parsedAnalytics.pageViews = currentViews;

    // Track real unique visitors by distinct user IDs
    let viewerList: string[] = Array.isArray(parsedAnalytics.viewerUserIds)
      ? parsedAnalytics.viewerUserIds
      : [];
    if (viewerUserId && !viewerList.includes(viewerUserId)) {
      viewerList.push(viewerUserId);
    }
    if (viewerList.length === 0) {
      viewerList = [viewerUserId || 'visitor_1'];
    }
    parsedAnalytics.viewerUserIds = viewerList;
    parsedAnalytics.uniqueVisitors = viewerList.length;

    // Compute REAL registration trajectory trend from actual bookings
    const activeBookings = (event.bookings || []).filter(
      (b) => b.status === 'RESERVED' || b.status === 'CONFIRMED' || b.checkedInAt != null
    );
    activeBookings.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const trendMap = new Map<string, number>();
    let cumulativeTickets = 0;

    if (activeBookings.length === 0) {
      const createdDateLabel = new Date(event.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      parsedAnalytics.registrationTrend = [{ date: createdDateLabel, count: 0 }];
    } else {
      activeBookings.forEach((b) => {
        const dateLabel = new Date(b.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        cumulativeTickets += b.quantity || 1;
        trendMap.set(dateLabel, cumulativeTickets);
      });
      parsedAnalytics.registrationTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
    }

    // Strip legacy static mock data fields
    delete parsedAnalytics.avgTimeOnPage;
    delete parsedAnalytics.conversionRate;
    delete parsedAnalytics.locationsCount;
    delete parsedAnalytics.geographicDistribution;
    delete parsedAnalytics.domainDistribution;
    delete parsedAnalytics.registrationStatus;
    delete parsedAnalytics.departmentWise;
    delete parsedAnalytics.participatingColleges;
    delete parsedAnalytics.yearWise;
    delete parsedAnalytics.domainWinRates;
    delete parsedAnalytics.averageWinRate;

    // Persist updated analytics in background
    prisma.event
      .update({
        where: { id },
        data: { analyticsData: JSON.stringify(parsedAnalytics) },
      })
      .catch(() => {});

    const now = new Date();
    let displayStatus = 'UPCOMING';
    if (event.status === 'COMPLETED' || now > event.endAt) {
      displayStatus = 'COMPLETED';
    } else if (now >= event.startAt && now <= event.endAt) {
      displayStatus = 'ONGOING';
    } else {
      displayStatus = 'UPCOMING';
    }

    const checkedInCount = (event.bookings || []).filter((b: any) => b.checkedInAt !== null).length;
    const totalBookingsCount = (event.bookings || []).filter((b: any) => b.status === 'CONFIRMED' || b.status === 'RESERVED').length;

    return {
      ...event,
      checkedInCount,
      totalBookingsCount,
      displayStatus,
      memberPriceINR: (event.memberPrice / 100).toFixed(0),
      nonMemberPriceINR: (event.nonMemberPrice / 100).toFixed(0),
      analytics: parsedAnalytics,
    };
  }

  /**
   * Explicitly record a page view for an event
   */
  async recordView(id: string, viewerUserId?: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, analyticsData: true },
    });
    if (!event) throw new Error('Event not found.');

    let parsed: any = {};
    try {
      if (event.analyticsData) parsed = JSON.parse(event.analyticsData);
    } catch {}

    parsed.pageViews = (Number(parsed.pageViews) || 0) + 1;
    let viewers: string[] = Array.isArray(parsed.viewerUserIds) ? parsed.viewerUserIds : [];
    if (viewerUserId && !viewers.includes(viewerUserId)) {
      viewers.push(viewerUserId);
    }
    if (viewers.length === 0) {
      viewers = [viewerUserId || 'visitor_1'];
    }
    parsed.viewerUserIds = viewers;
    parsed.uniqueVisitors = viewers.length;

    await prisma.event.update({
      where: { id },
      data: { analyticsData: JSON.stringify(parsed) },
    });

    return {
      pageViews: parsed.pageViews,
      uniqueVisitors: parsed.uniqueVisitors,
    };
  }

  /**
   * Create Event (by Club President or Organizer)
   */
  async createEvent(
    creatorUserId: string,
    data: {
      organizationId?: string;
      title: string;
      description: string;
      category?: string;
      domain?: string;
      venue: string;
      mode?: string;
      startAt: string | Date;
      endAt: string | Date;
      totalSeats: number;
      memberPriceINR: number;
      nonMemberPriceINR: number;
      bannerUrl?: string;
      inchargeId?: string;
      prizes?: string;
    }
  ) {
    // Resolve organization
    let orgId = data.organizationId;
    if (!orgId) {
      const presRole = await prisma.userRole.findFirst({
        where: {
          userId: creatorUserId,
          role: { in: [RoleType.PRESIDENT, RoleType.ADMIN, RoleType.EVENT_ORGANIZER] },
          organizationId: { not: null },
        },
      });
      orgId = presRole?.organizationId || undefined;
    }

    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }

    if (!orgId) {
      throw new Error('No club organization available to host this event.');
    }

    // Slug generation
    const slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    const totalSeats = Number(data.totalSeats) || 100;
    const memberPrice = Math.round(Number(data.memberPriceINR || 0) * 100);
    const nonMemberPrice = Math.round(Number(data.nonMemberPriceINR || 0) * 100);

    // Clean initial analytics for newly created events (real data only, no static mocks)
    const initialAnalytics = {
      pageViews: 1,
      uniqueVisitors: 1,
      viewerUserIds: [creatorUserId],
      registrationTrend: [
        {
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: 0,
        },
      ],
    };

    const newEvent = await prisma.event.create({
      data: {
        id: uuidv7(),
        organizationId: orgId,
        title: data.title,
        slug,
        description: data.description,
        category: data.category || 'Hackathon',
        domain: data.domain || 'AI/ML',
        venue: data.venue,
        mode: data.mode || 'offline',
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        totalSeats,
        remainingSeats: totalSeats,
        teamsCount: 0,
        memberPrice,
        nonMemberPrice,
        bannerUrl:
          data.bannerUrl ||
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
        inchargeId: data.inchargeId || null,
        prizes: data.prizes || null,
        status: EventStatus.PUBLISHED,
        analyticsData: JSON.stringify(initialAnalytics),
      },
      include: {
        organization: true,
        incharge: true,
      },
    });

    // If incharge assigned, ensure user has EVENT_ORGANIZER role
    if (data.inchargeId) {
      const existingRole = await prisma.userRole.findFirst({
        where: {
          userId: data.inchargeId,
          role: RoleType.EVENT_ORGANIZER,
          organizationId: orgId,
        },
      });

      if (!existingRole) {
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: data.inchargeId,
            role: RoleType.EVENT_ORGANIZER,
            organizationId: orgId,
          },
        });
      }

      // Notify the assigned incharge
      await prisma.notification.create({
        data: {
          id: uuidv7(),
          userId: data.inchargeId,
          title: `Assigned Event Incharge: ${newEvent.title}`,
          message: `Club President appointed you as Lead Incharge for ${newEvent.title}. Access the Organizer console to manage fees, ticketing, and assign volunteer tasks.`,
          type: 'EVENT_INCHARGE',
          link: '/organizer/events',
        },
      });
    }

    // Broadcast campus notification
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        title: `New Event: ${newEvent.title}`,
        message: `${newEvent.category} announced at ${newEvent.venue}. Registration is now open!`,
        type: 'EVENT_PUBLISHED',
        link: '/student/events',
      },
    });

    return newEvent;
  }

  /**
   * Update Event (Details, incharge, ticket count, status)
   */
  async updateEvent(
    userId: string,
    eventId: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      domain?: string;
      venue?: string;
      mode?: string;
      startAt?: string | Date;
      endAt?: string | Date;
      totalSeats?: number;
      remainingSeats?: number;
      teamsCount?: number;
      memberPriceINR?: number;
      nonMemberPriceINR?: number;
      bannerUrl?: string;
      inchargeId?: string;
      prizes?: string;
      status?: EventStatus;
    }
  ) {
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      throw new Error('Event not found.');
    }

    const updatePayload: any = {};
    if (data.title) updatePayload.title = data.title;
    if (data.description) updatePayload.description = data.description;
    if (data.category) updatePayload.category = data.category;
    if (data.domain) updatePayload.domain = data.domain;
    if (data.venue) updatePayload.venue = data.venue;
    if (data.mode) updatePayload.mode = data.mode;
    if (data.startAt) updatePayload.startAt = new Date(data.startAt);
    if (data.endAt) updatePayload.endAt = new Date(data.endAt);
    if (data.totalSeats !== undefined) updatePayload.totalSeats = Number(data.totalSeats);
    if (data.remainingSeats !== undefined) updatePayload.remainingSeats = Number(data.remainingSeats);
    if (data.teamsCount !== undefined) updatePayload.teamsCount = Number(data.teamsCount);
    if (data.bannerUrl) updatePayload.bannerUrl = data.bannerUrl;
    if (data.prizes !== undefined) updatePayload.prizes = data.prizes;
    if (data.status) updatePayload.status = data.status;

    if (data.memberPriceINR !== undefined) {
      updatePayload.memberPrice = Math.round(Number(data.memberPriceINR) * 100);
    }
    if (data.nonMemberPriceINR !== undefined) {
      updatePayload.nonMemberPrice = Math.round(Number(data.nonMemberPriceINR) * 100);
    }

    if (data.inchargeId && data.inchargeId !== existing.inchargeId) {
      updatePayload.inchargeId = data.inchargeId;
      // Ensure incharge role
      const roleExists = await prisma.userRole.findFirst({
        where: {
          userId: data.inchargeId,
          role: RoleType.EVENT_ORGANIZER,
          organizationId: existing.organizationId,
        },
      });
      if (!roleExists) {
        await prisma.userRole.create({
          data: {
            id: uuidv7(),
            userId: data.inchargeId,
            role: RoleType.EVENT_ORGANIZER,
            organizationId: existing.organizationId,
          },
        });
      }
    }

    return prisma.event.update({
      where: { id: eventId },
      data: updatePayload,
      include: {
        organization: true,
        incharge: true,
      },
    });
  }

  /**
   * Assign Volunteer Task (by Event Organizer)
   */
  async assignTask(
    organizerUserId: string,
    eventId: string,
    data: {
      title: string;
      description?: string;
      assignedToId?: string;
      priority?: string;
      deadline?: string | Date;
    }
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    const task = await prisma.eventTask.create({
      data: {
        id: uuidv7(),
        eventId,
        title: data.title,
        description: data.description || null,
        assignedToId: data.assignedToId || null,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        assignedTo: true,
      },
    });

    // Notify assigned volunteer
    if (data.assignedToId) {
      await prisma.notification.create({
        data: {
          id: uuidv7(),
          userId: data.assignedToId,
          title: `New Task Assigned: ${data.title}`,
          message: `Assigned for event "${event.title}". Priority: ${data.priority || 'MEDIUM'}.`,
          type: 'TASK_ASSIGNED',
          link: '/volunteer/tasks',
        },
      });
    }

    return task;
  }

  /**
   * Update Task Status (e.g. volunteer marks IN_PROGRESS or COMPLETED)
   */
  async updateTaskStatus(taskId: string, status: string) {
    return prisma.eventTask.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignedTo: true,
      },
    });
  }

  /**
   * Get Event Organizer Dashboard Overview Metrics
   */
  async getOrganizerOverview(organizerUserId?: string) {
    const events = await prisma.event.findMany({
      include: {
        bookings: true,
        tasks: true,
      },
      orderBy: { startAt: 'asc' },
    });

    const totalEvents = events.length;
    let totalSeats = 0;
    let totalRemainingSeats = 0;
    let totalTicketsSold = 0;
    let totalRevenuePaise = 0;
    let totalCheckedIn = 0;

    events.forEach((e) => {
      totalSeats += e.totalSeats;
      totalRemainingSeats += e.remainingSeats;
      const sold = Math.max(0, e.totalSeats - e.remainingSeats);
      totalTicketsSold += sold;

      e.bookings.forEach((b) => {
        if (b.status === 'CONFIRMED') {
          totalRevenuePaise += b.totalAmount;
          if (b.checkedInAt) {
            totalCheckedIn += 1;
          }
        }
      });
    });

    // If bookings count is lower than synthetic sold seats in prototype, supplement with calculated floor
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            venue: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const tasks = await prisma.eventTask.findMany({
      include: {
        assignedTo: true,
        event: { select: { id: true, title: true } },
      },
    });

    const tasksPending = tasks.filter((t) => t.status === 'PENDING').length;
    const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;

    // Check-in Turnout calculation
    const turnoutRate =
      totalTicketsSold > 0
        ? Math.round((totalCheckedIn / Math.max(1, totalTicketsSold)) * 100)
        : 0;

    return {
      totalEvents,
      totalSeats,
      totalRemainingSeats,
      totalTicketsSold,
      totalRevenueINR: Math.round(totalRevenuePaise / 100),
      totalCheckedIn,
      turnoutRate,
      tasksSummary: {
        total: tasks.length,
        pending: tasksPending,
        inProgress: tasksInProgress,
        completed: tasksCompleted,
      },
      recentBookings: confirmedBookings,
    };
  }

  /**
   * Get Attendees for a specific Event (for Event Day Check-in & Quotas)
   */
  async getEventAttendees(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        totalSeats: true,
        remainingSeats: true,
        memberPrice: true,
        nonMemberPrice: true,
        venue: true,
        startAt: true,
      },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            razorpayPaymentId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const checkedInCount = bookings.filter((b) => b.checkedInAt !== null).length;
    const totalCount = bookings.length;
    const checkinPercentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

    return {
      event,
      attendees: bookings,
      checkedInCount,
      totalCount,
      checkinPercentage,
    };
  }

  /**
   * Toggle Attendee Check-in Status on Event Day
   */
  async toggleAttendeeCheckin(bookingId: string, checkedIn: boolean) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, event: true },
    });

    if (!booking) {
      throw new Error('Booking record not found.');
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        checkedInAt: checkedIn ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Get Revenue & Fee Collection Details
   */
  async getRevenueDetails() {
    const events = await prisma.event.findMany({
      include: {
        bookings: {
          include: {
            payments: true,
            user: { select: { id: true, fullName: true, username: true } },
          },
        },
      },
      orderBy: { startAt: 'desc' },
    });

    let totalCollectedPaise = 0;
    let totalPendingPaise = 0;
    let memberDiscountSavingsPaise = 0;

    const eventBreakdowns = events.map((ev) => {
      let evCollected = 0;
      let evMemberTickets = 0;
      let evRegularTickets = 0;

      ev.bookings.forEach((b) => {
        if (b.status === 'CONFIRMED') {
          evCollected += b.totalAmount;
          if (b.unitPrice === ev.memberPrice) {
            evMemberTickets += b.quantity;
            memberDiscountSavingsPaise += Math.max(0, ev.nonMemberPrice - ev.memberPrice) * b.quantity;
          } else {
            evRegularTickets += b.quantity;
          }
        } else if (b.status === 'PENDING_PAYMENT') {
          totalPendingPaise += b.totalAmount;
        }
      });

      totalCollectedPaise += evCollected;

      return {
        eventId: ev.id,
        eventTitle: ev.title,
        category: ev.category,
        domain: ev.domain,
        memberPriceINR: Math.round(ev.memberPrice / 100),
        regularPriceINR: Math.round(ev.nonMemberPrice / 100),
        totalSeats: ev.totalSeats,
        remainingSeats: ev.remainingSeats,
        ticketsSold: Math.max(0, ev.totalSeats - ev.remainingSeats),
        memberTicketsSold: evMemberTickets,
        regularTicketsSold: evRegularTickets,
        totalRevenueINR: Math.round(evCollected / 100),
      };
    });

    const recentPayments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
        booking: {
          include: {
            event: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    return {
      summary: {
        totalCollectedINR: Math.round(totalCollectedPaise / 100),
        totalPendingINR: Math.round(totalPendingPaise / 100),
        memberSavingsINR: Math.round(memberDiscountSavingsPaise / 100),
        totalTransactions: recentPayments.length,
      },
      eventBreakdowns,
      recentPayments,
    };
  }

  /**
   * Get Volunteer Management Console Data (Squads & Task Delegation)
   */
  async getVolunteerManagement(organizationId?: string) {
    const whereOrg = organizationId ? { organizationId } : {};

    // Get all volunteer users
    const volunteerRoles = await prisma.userRole.findMany({
      where: {
        role: { in: [RoleType.VOLUNTEER, RoleType.MEMBER] },
        ...whereOrg,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
      },
    });

    // Unique volunteers
    const volunteerMap = new Map();
    volunteerRoles.forEach((vr) => {
      if (!volunteerMap.has(vr.user.id)) {
        volunteerMap.set(vr.user.id, vr.user);
      }
    });
    const volunteers = Array.from(volunteerMap.values());

    const tasks = await prisma.eventTask.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startAt: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return {
      volunteers,
      tasks,
    };
  }

  /**
   * Book Event Ticket (Concurrency-safe via Redis 5-min booking window reservation)
   */
  async bookTicket(
    userId: string,
    eventId: string,
    data: { quantity?: number; paymentMethod?: string; bookingWindowToken?: string }
  ) {
    // If client supplied a valid booking window token, confirm that reservation directly
    if (data.bookingWindowToken) {
      const confirmResult = await ticketReservationService.confirmBooking(userId, eventId, {
        bookingWindowToken: data.bookingWindowToken,
        paymentMethod: data.paymentMethod,
      });

      return {
        ...confirmResult.booking,
        payment: confirmResult.payment,
        qrPayload: confirmResult.qrPayload,
        otpCode: confirmResult.otpCode,
        isMemberPriceApplied:
          confirmResult.booking.unitPrice === confirmResult.booking.event?.memberPrice,
      };
    }

    // Otherwise, perform atomic reserve + confirm pipeline through Redis
    const reservation = await ticketReservationService.reserveTicket(
      userId,
      eventId,
      data.quantity
    );

    const confirmResult = await ticketReservationService.confirmBooking(userId, eventId, {
      bookingWindowToken: reservation.bookingWindowToken,
      paymentMethod: data.paymentMethod,
    });

    return {
      ...confirmResult.booking,
      payment: confirmResult.payment,
      qrPayload: confirmResult.qrPayload,
      otpCode: confirmResult.otpCode,
      isMemberPriceApplied: reservation.isMemberPriceApplied,
    };
  }


  /**
   * Generate Authentic QR Code Data URL using Node.js 'qrcode' library
   */
  async generateTicketQrCode(payload: string, options?: { size?: number }) {
    if (!payload?.trim()) {
      throw new Error('Payload is required to generate QR code.');
    }
    const cleanPayload = payload.trim();
    const width = options?.size || 300;
    const dataUrl = await QRCode.toDataURL(cleanPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return {
      payload: cleanPayload,
      dataUrl,
    };
  }

  /**
   * Fetch recent tickets/passes with generated QR codes for Volunteer Desk
   */
  async getRecentEventTickets(limit = 15) {
    const bookings = await prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startAt: true,
          },
        },
      },
    });

    return await Promise.all(
      bookings.map(async (b) => {
        const qrPayload = `CAMPUSMITRA:${b.bookingNumber}:${b.otpCode || '123456'}`;
        let qrCodeDataUrl = '';
        try {
          qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 250,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch {
          // ignore
        }
        return {
          ...b,
          qrPayload,
          qrCodeDataUrl,
        };
      })
    );
  }

  /**
   * Get Current User's Tickets / Passes with Node.js generated QR codes
   */
  async getMyTickets(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        event: {
          include: { organization: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return await Promise.all(
      bookings.map(async (b) => {
        const qrPayload = `CAMPUSMITRA:${b.bookingNumber}:${b.otpCode || '123456'}`;
        let qrCodeDataUrl = '';
        try {
          qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 250,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch {
          // fallback
        }
        return {
          ...b,
          qrPayload,
          qrCodeDataUrl,
        };
      })
    );
  }

  /**
   * Verify Ticket for Volunteer Door Check-in (supports Camera QR Scan or 6-Digit OTP)
   */
  async verifyCheckinTicket(rawCode: string) {
    let cleanCode = (rawCode || '').trim();

    if (!cleanCode) {
      throw new Error('Please provide a valid Ticket Pass number, QR code, or 6-digit OTP.');
    }

    const searchTerms: string[] = [cleanCode];

    // 1. JSON QR payload
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.bookingNumber) searchTerms.push(String(parsed.bookingNumber));
        if (parsed.code) searchTerms.push(String(parsed.code));
        if (parsed.otpCode) searchTerms.push(String(parsed.otpCode));
      } catch {
        // ignore
      }
    }

    // 2. URL parameters
    if (cleanCode.includes('?')) {
      try {
        const urlParams = new URLSearchParams(cleanCode.split('?')[1]);
        const paramCode = urlParams.get('code') || urlParams.get('ticket') || urlParams.get('booking');
        if (paramCode) searchTerms.push(paramCode);
      } catch {
        // ignore
      }
    }

    // 3. CAMPUSMITRA:BOOKING:OTP
    if (cleanCode.startsWith('CAMPUSMITRA:')) {
      const parts = cleanCode.split(':');
      parts.forEach((p) => {
        if (p.trim()) searchTerms.push(p.trim());
      });
    }

    // Also strip '#' if present
    const additionalTerms = searchTerms.map((t) => t.replace(/^#/, '')).filter((t) => t.length > 0);
    searchTerms.push(...additionalTerms);

    const uniqueTerms = Array.from(new Set(searchTerms.filter(Boolean)));

    // Try finding by bookingNumber, otpCode, or id across all extracted candidates
    const booking = await prisma.booking.findFirst({
      where: {
        OR: uniqueTerms.flatMap((term) => [
          { bookingNumber: { equals: term } },
          { otpCode: { equals: term } },
          { id: { equals: term } },
        ]),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            avatarUrl: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startAt: true,
            category: true,
          },
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        verified: false,
        message: `Invalid pass or OTP code "${cleanCode}". No active registration found.`,
      };
    }

    if (booking.checkedInAt) {
      return {
        success: false,
        alreadyCheckedIn: true,
        verified: true,
        booking,
        message: `⚠️ ATTENTION: Attendee "${booking.user.fullName}" was ALREADY CHECKED IN on ${new Date(booking.checkedInAt).toLocaleTimeString()}!`,
      };
    }

    // Mark as checked in
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date() },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            avatarUrl: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startAt: true,
            category: true,
          },
        },
      },
    });

    return {
      success: true,
      verified: true,
      alreadyCheckedIn: false,
      booking: updated,
      message: `✅ Admission Approved! Welcome ${booking.user.fullName} (${booking.quantity} seat${booking.quantity > 1 ? 's' : ''}).`,
    };
  }

  /**
   * Send Email Announcement to Registered Event Attendees with Check-in Status Filter
   */
  async sendEventAnnouncementEmail(
    eventId: string,
    organizerUserId: string,
    payload: {
      subject: string;
      message: string;
      filter: 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN';
      priority?: string;
    }
  ) {
    if (!payload.subject || !payload.subject.trim()) {
      throw new Error('Announcement subject is required.');
    }
    if (!payload.message || !payload.message.trim()) {
      throw new Error('Announcement message content is required.');
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    // Fetch organizer info for the email sender signature
    let senderName = 'Event Organizing Committee';
    try {
      const organizer = await prisma.user.findUnique({
        where: { id: organizerUserId },
        select: { fullName: true },
      });
      if (organizer?.fullName) {
        senderName = `${organizer.fullName} (Event Organizer)`;
      }
    } catch {
      // fallback
    }

    // Build booking filter query based on requested filter
    const whereClause: any = {
      eventId,
      status: { in: ['CONFIRMED', 'RESERVED'] },
    };

    if (payload.filter === 'CHECKED_IN') {
      whereClause.checkedInAt = { not: null };
    } else if (payload.filter === 'NOT_CHECKED_IN') {
      whereClause.checkedInAt = null;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Valid unique recipients
    const validRecipientsMap = new Map<
      string,
      {
        userId: string;
        name: string;
        email: string;
        bookingNumber: string;
        isCheckedIn: boolean;
      }
    >();

    for (const b of bookings) {
      if (b.user?.email && b.user.email.includes('@')) {
        const emailLower = b.user.email.toLowerCase().trim();
        if (!validRecipientsMap.has(emailLower)) {
          validRecipientsMap.set(emailLower, {
            userId: b.user.id,
            name: b.user.fullName || 'Attendee',
            email: b.user.email.trim(),
            bookingNumber: b.bookingNumber,
            isCheckedIn: b.checkedInAt !== null,
          });
        }
      }
    }

    const recipientsList = Array.from(validRecipientsMap.values());

    if (recipientsList.length === 0) {
      return {
        success: true,
        totalRecipients: 0,
        sentCount: 0,
        failedCount: 0,
        eventTitle: event.title,
        filter: payload.filter,
        recipients: [],
        message: 'No registered attendees matched the selected filter.',
      };
    }

    // Dispatch email announcements via Nodemailer
    let sentCount = 0;
    let failedCount = 0;
    const recipientResults: { name: string; email: string; isCheckedIn: boolean; status: 'SENT' | 'FAILED' }[] = [];

    // Send emails sequentially or in parallel
    for (const item of recipientsList) {
      try {
        await emailService.sendEventAnnouncementEmail({
          recipientEmail: item.email,
          recipientName: item.name,
          eventTitle: event.title,
          venue: event.venue,
          startAt: event.startAt,
          subject: payload.subject.trim(),
          message: payload.message.trim(),
          senderName,
          filterType: payload.filter,
          bookingNumber: item.bookingNumber,
          isCheckedIn: item.isCheckedIn,
        });
        sentCount++;
        recipientResults.push({
          name: item.name,
          email: item.email,
          isCheckedIn: item.isCheckedIn,
          status: 'SENT',
        });
      } catch (err: any) {
        console.error(`Failed to send announcement email to ${item.email}:`, err.message);
        failedCount++;
        recipientResults.push({
          name: item.name,
          email: item.email,
          isCheckedIn: item.isCheckedIn,
          status: 'FAILED',
        });
      }
    }

    // Record in database announcement log
    try {
      await prisma.announcement.create({
        data: {
          id: uuidv7(),
          organizationId: event.organizationId,
          authorId: organizerUserId,
          title: `[${event.title}] ${payload.subject.trim()}`,
          content: `${payload.message.trim()}\n\n(Sent via Nodemailer to ${
            payload.filter === 'ALL'
              ? 'All Registered Attendees'
              : payload.filter === 'CHECKED_IN'
              ? 'Checked-In Attendees Only'
              : 'Pending Check-In Attendees Only'
          })`,
          category: 'EVENT',
          isPinned: false,
        },
      });
    } catch (e: any) {
      console.warn('Could not record announcement in database table:', e.message);
    }

    return {
      success: true,
      totalRecipients: recipientsList.length,
      sentCount,
      failedCount,
      eventTitle: event.title,
      filter: payload.filter,
      recipients: recipientResults,
      message: `Announcement email successfully dispatched via Nodemailer to ${sentCount} recipient(s)${
        failedCount > 0 ? ` (${failedCount} failed)` : ''
      }.`,
    };
  }
}

export const eventService = new EventService();

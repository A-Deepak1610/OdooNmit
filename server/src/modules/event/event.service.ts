import { PrismaClient, EventStatus, RoleType } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid';

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
      },
      orderBy: { startAt: 'asc' },
    });

    return events.map((e) => {
      let parsedAnalytics = null;
      try {
        if (e.analyticsData) {
          parsedAnalytics = JSON.parse(e.analyticsData);
        }
      } catch {
        parsedAnalytics = null;
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

      return {
        ...e,
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
  async getEventById(id: string) {
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

    let parsedAnalytics = null;
    try {
      if (event.analyticsData) {
        parsedAnalytics = JSON.parse(event.analyticsData);
      }
    } catch {
      parsedAnalytics = null;
    }

    const now = new Date();
    let displayStatus = 'UPCOMING';
    if (event.status === 'COMPLETED' || now > event.endAt) {
      displayStatus = 'COMPLETED';
    } else if (now >= event.startAt && now <= event.endAt) {
      displayStatus = 'ONGOING';
    } else {
      displayStatus = 'UPCOMING';
    }

    return {
      ...event,
      displayStatus,
      memberPriceINR: (event.memberPrice / 100).toFixed(0),
      nonMemberPriceINR: (event.nonMemberPrice / 100).toFixed(0),
      analytics: parsedAnalytics,
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

    // Default analytics blueprint matching Image 2
    const defaultAnalytics = {
      pageViews: Math.floor(600 + Math.random() * 600),
      uniqueVisitors: Math.floor(400 + Math.random() * 400),
      avgTimeOnPage: '3m 15s',
      conversionRate: '17.5%',
      locationsCount: 5,
      geographicDistribution: [
        { city: 'Chennai', state: 'Tamil Nadu', teams: 15, lat: 13.0827, lng: 80.2707 },
        { city: 'Bangalore', state: 'Karnataka', teams: 11, lat: 12.9716, lng: 77.5946 },
        { city: 'Hyderabad', state: 'Telangana', teams: 7, lat: 17.3850, lng: 78.4867 },
        { city: 'Mumbai', state: 'Maharashtra', teams: 4, lat: 19.0760, lng: 72.8777 },
        { city: 'Coimbatore', state: 'Tamil Nadu', teams: 4, lat: 11.0168, lng: 76.9558 },
      ],
      domainDistribution: {
        'AI/ML': 28,
        'Web Development': 23,
        IoT: 19,
        'Mobile Apps': 17,
        Blockchain: 13,
      },
      registrationStatus: {
        approved: 25,
        pending: 4,
        rejected: 1,
      },
      departmentWise: {
        CSE: 45,
        ISE: 25,
        ECE: 18,
        ME: 12,
        AIML: 10,
      },
      participatingColleges: [
        { college: 'Sathyabama Institute', city: 'Chennai', teams: 8 },
        { college: 'VIT Chennai', city: 'Chennai', teams: 6 },
        { college: 'SRM University', city: 'Chennai', teams: 5 },
        { college: 'RVCE', city: 'Bangalore', teams: 4 },
        { college: 'BITS Pilani', city: 'Hyderabad', teams: 3 },
      ],
      yearWise: {
        '2nd Year': 30,
        '3rd Year': 45,
        '4th Year': 25,
      },
      registrationTrend: [
        { date: 'Day 1', count: 5 },
        { date: 'Day 3', count: 12 },
        { date: 'Day 5', count: 20 },
        { date: 'Day 7', count: 29 },
      ],
      domainWinRates: [
        { domain: 'AI/ML', participated: 25, wins: 4, rate: '16.0%' },
        { domain: 'Web Development', participated: 20, wins: 3, rate: '15.0%' },
        { domain: 'IoT', participated: 15, wins: 2, rate: '13.3%' },
      ],
      averageWinRate: '14.8%',
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
        analyticsData: JSON.stringify(defaultAnalytics),
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
   * Book Event Ticket (Member or Non-Member price, Mock Payment simulation, OTP & QR Generation)
   */
  async bookTicket(
    userId: string,
    eventId: string,
    data: { quantity?: number; paymentMethod?: string }
  ) {
    const qty = Math.max(1, Math.min(10, Number(data.quantity) || 1));

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.remainingSeats < qty) {
      throw new Error(`Only ${event.remainingSeats} seat(s) remaining for this event.`);
    }

    // Check if user is a member of this club/organization
    const membershipRole = await prisma.userRole.findFirst({
      where: {
        userId,
        organizationId: event.organizationId,
        role: { in: [RoleType.MEMBER, RoleType.PRESIDENT, RoleType.TREASURER, RoleType.EVENT_ORGANIZER, RoleType.VOLUNTEER] },
      },
    });

    const isMember = !!membershipRole;
    const unitPrice = isMember ? event.memberPrice : event.nonMemberPrice;
    const totalAmount = unitPrice * qty;

    // 6-digit verification OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const bookingNumber = `TKT-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        id: uuidv7(),
        bookingNumber,
        userId,
        eventId,
        quantity: qty,
        unitPrice,
        totalAmount,
        currency: 'INR',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        otpCode,
      },
      include: {
        event: {
          include: { organization: true },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create Mock Payment record
    const mockPayId = `mock_pay_${Math.random().toString(36).substring(2, 10)}`;
    await prisma.payment.create({
      data: {
        id: uuidv7(),
        userId,
        bookingId: booking.id,
        status: 'CAPTURED',
        amount: totalAmount,
        currency: 'INR',
        razorpayPaymentId: mockPayId,
        razorpayOrderId: `mock_order_${Math.random().toString(36).substring(2, 10)}`,
        capturedAt: new Date(),
      },
    });

    // Decrement remaining seats
    await prisma.event.update({
      where: { id: eventId },
      data: {
        remainingSeats: Math.max(0, event.remainingSeats - qty),
      },
    });

    // Generate User Notification
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        userId,
        title: `🎟️ Ticket Confirmed: ${event.title}`,
        message: `Your booking #${booking.bookingNumber} is confirmed! OTP: ${otpCode}. Venue: ${event.venue}. Present your QR code at the door.`,
        type: 'TICKET_CONFIRMED',
        link: '/member/tickets',
      },
    });

    return {
      ...booking,
      isMemberPriceApplied: isMember,
      qrPayload: `CAMPUSMITRA:${booking.bookingNumber}:${otpCode}`,
    };
  }

  /**
   * Get Current User's Tickets / Passes
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

    return bookings.map((b) => ({
      ...b,
      qrPayload: `CAMPUSMITRA:${b.bookingNumber}:${b.otpCode || '123456'}`,
    }));
  }

  /**
   * Verify Ticket for Volunteer Door Check-in (supports QR Scan or 6-Digit OTP)
   */
  async verifyCheckinTicket(rawCode: string) {
    let cleanCode = (rawCode || '').trim();
    if (cleanCode.startsWith('CAMPUSMITRA:')) {
      const parts = cleanCode.split(':');
      if (parts.length >= 2) {
        cleanCode = parts[1]; // bookingNumber
      }
    }

    if (!cleanCode) {
      throw new Error('Please provide a valid Ticket Pass number, QR code, or 6-digit OTP.');
    }

    // Try finding by bookingNumber, otpCode, or id
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { bookingNumber: { equals: cleanCode } },
          { otpCode: { equals: cleanCode } },
          { id: { equals: cleanCode } },
        ],
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
}

export const eventService = new EventService();

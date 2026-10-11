import { apiClient } from './api-client';

export interface EventAnalyticsData {
  pageViews?: number;
  uniqueVisitors?: number;
  registrationTrend?: Array<{
    date: string;
    count: number;
  }>;
  avgTimeOnPage?: string;
  conversionRate?: string;
  locationsCount?: number;
  geographicDistribution?: Array<{
    city: string;
    state: string;
    teams: number;
    lat?: number;
    lng?: number;
  }>;
  domainDistribution?: Record<string, number>;
  registrationStatus?: {
    approved: number;
    pending: number;
    rejected: number;
  };
  departmentWise?: Record<string, number>;
  participatingColleges?: Array<{
    college: string;
    city: string;
    teams: number;
  }>;
  yearWise?: Record<string, number>;
  domainWinRates?: Array<{
    domain: string;
    participated: number;
    wins: number;
    rate: string;
  }>;
  averageWinRate?: string;
}

export interface EventTaskItem {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  assignedToId: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline: string | null;
  createdAt: string;
  assignedTo?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    email?: string;
  } | null;
}

export interface CampusEventItem {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  domain: string;
  venue: string;
  mode: 'offline' | 'online' | 'hybrid';
  startAt: string;
  endAt: string;
  createdAt?: string;
  updatedAt?: string;
  checkedInCount?: number;
  totalBookingsCount?: number;
  totalSeats: number;
  remainingSeats: number;
  teamsCount: number;
  memberPrice: number;
  nonMemberPrice: number;
  memberPriceINR: string;
  nonMemberPriceINR: string;
  bannerUrl: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  displayStatus: 'ONGOING' | 'UPCOMING' | 'COMPLETED' | 'DRAFT';
  inchargeId: string | null;
  prizes: string | null;
  analytics: EventAnalyticsData | null;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  incharge?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  tasks?: EventTaskItem[];
}

export const eventService = {
  // 1. Get events with search, status, and domain filters
  async getEvents(params?: {
    search?: string;
    status?: string;
    domain?: string;
    category?: string;
    organizationId?: string;
    inchargeId?: string;
    postedDate?: string;
    sortBy?: string;
  }): Promise<CampusEventItem[]> {
    const res = await apiClient.get<{ success: boolean; data: CampusEventItem[] }>('/events', {
      params,
    });
    return res.data.data;
  },

  // 2. Get event details with full analytics and volunteer tasks
  async getEventById(id: string): Promise<CampusEventItem> {
    const res = await apiClient.get<{ success: boolean; data: CampusEventItem }>(`/events/${id}`);
    return res.data.data;
  },

  // Record real page view count for event
  async recordView(id: string): Promise<{ pageViews: number; uniqueVisitors: number }> {
    const res = await apiClient.post<{ success: boolean; data: { pageViews: number; uniqueVisitors: number } }>(
      `/events/${id}/view`
    );
    return res.data.data;
  },

  // 3. Create new event (President or Organizer)
  async createEvent(data: {
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
  }): Promise<CampusEventItem> {
    const res = await apiClient.post<{ success: boolean; data: CampusEventItem; message: string }>(
      '/events',
      data
    );
    return res.data.data;
  },

  // 4. Update event
  async updateEvent(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      domain: string;
      venue: string;
      mode: string;
      startAt: string | Date;
      endAt: string | Date;
      totalSeats: number;
      remainingSeats: number;
      teamsCount: number;
      memberPriceINR: number;
      nonMemberPriceINR: number;
      bannerUrl: string;
      inchargeId: string;
      prizes: string;
      status: string;
    }>
  ): Promise<CampusEventItem> {
    const res = await apiClient.patch<{ success: boolean; data: CampusEventItem; message: string }>(
      `/events/${id}`,
      data
    );
    return res.data.data;
  },

  // 5. Assign task to volunteer
  async assignTask(
    eventId: string,
    data: {
      title: string;
      description?: string;
      assignedToId?: string;
      priority?: string;
      deadline?: string | Date;
    }
  ): Promise<EventTaskItem> {
    const res = await apiClient.post<{ success: boolean; data: EventTaskItem; message: string }>(
      `/events/${eventId}/tasks`,
      data
    );
    return res.data.data;
  },

  // 6. Update task status (Volunteer)
  async updateTaskStatus(taskId: string, status: string): Promise<EventTaskItem> {
    const res = await apiClient.patch<{ success: boolean; data: EventTaskItem; message: string }>(
      `/events/tasks/${taskId}/status`,
      { status }
    );
    return res.data.data;
  },

  // 7. Get Event Organizer Console Overview
  async getOrganizerOverview(): Promise<{
    totalEvents: number;
    totalSeats: number;
    totalRemainingSeats: number;
    totalTicketsSold: number;
    totalRevenueINR: number;
    totalCheckedIn: number;
    turnoutRate: number;
    tasksSummary: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
    };
    recentBookings: any[];
  }> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/events/organizer/overview');
    return res.data.data;
  },

  // 8. Get Event Attendees (for Event Day Check-in & Quotas)
  async getEventAttendees(eventId: string): Promise<{
    event: any;
    attendees: any[];
    checkedInCount: number;
    totalCount: number;
    checkinPercentage: number;
  }> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/events/${eventId}/attendees`);
    return res.data.data;
  },

  // 9. Toggle Attendee Check-in on Event Day
  async toggleAttendeeCheckin(bookingId: string, checkedIn: boolean): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any; message: string }>(
      `/events/attendees/${bookingId}/checkin`,
      { checkedIn }
    );
    return res.data.data;
  },

  // 10. Get Revenue Details & Fee Collections
  async getRevenueDetails(): Promise<{
    summary: {
      totalCollectedINR: number;
      totalPendingINR: number;
      memberSavingsINR: number;
      totalTransactions: number;
    };
    eventBreakdowns: any[];
    recentPayments: any[];
  }> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/events/organizer/revenue');
    return res.data.data;
  },

  // 11. Get Volunteer Management Data
  async getVolunteerManagement(organizationId?: string): Promise<{
    volunteers: any[];
    tasks: any[];
  }> {
    const res = await apiClient.get<{ success: boolean; data: any }>('/events/organizer/volunteers', {
      params: { organizationId },
    });
    return res.data.data;
  },

  // 12. Reserve Event Ticket (Redis 5-minute concurrency lock)
  async reserveTicket(
    eventId: string,
    quantity: number
  ): Promise<{
    success: boolean;
    data: {
      bookingWindowToken: string;
      bookingId: string;
      bookingNumber: string;
      eventId: string;
      eventTitle: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
      isMemberPriceApplied: boolean;
      expiresAt: string;
      remainingSeconds: number;
      remainingSeatsInPool: number;
      message: string;
    };
    message: string;
  }> {
    const res = await apiClient.post(`/events/${eventId}/reserve`, { quantity });
    return res.data;
  },

  // 12b. Confirm Booking using Booking Window Token
  async confirmBooking(
    eventId: string,
    data: {
      bookingWindowToken: string;
      paymentMethod?: string;
    }
  ): Promise<{
    data: any;
    message: string;
  }> {
    const res = await apiClient.post(`/events/${eventId}/confirm-booking`, data);
    return res.data;
  },

  // 12c. Release / Cancel Active Reservation
  async releaseReservation(
    eventId: string,
    bookingWindowToken: string
  ): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    const res = await apiClient.post(`/events/${eventId}/release-reservation`, {
      bookingWindowToken,
    });
    return res.data;
  },

  // 12d. Check Reservation Status / TTL
  async getReservationStatus(token: string): Promise<{
    success: boolean;
    data: {
      valid: boolean;
      remainingSeconds: number;
      reservation: any | null;
    };
  }> {
    const res = await apiClient.get(`/events/reservation-status/${token}`);
    return res.data;
  },

  // Legacy / Direct Book Event Ticket
  async bookTicket(
    eventId: string,
    data: { quantity: number; paymentMethod?: string; bookingWindowToken?: string }
  ): Promise<{
    data: any;
    message: string;
  }> {
    const res = await apiClient.post<{ success: boolean; data: any; message: string }>(
      `/events/${eventId}/book`,
      data
    );
    return res.data;
  },


  // 13. Get Current User's Booked Tickets & QR Passes
  async getMyTickets(): Promise<any[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/events/tickets/my-tickets');
    return res.data.data;
  },

  // 14. Verify Check-in for Volunteer Door Station (via QR code or 6-digit OTP)
  async verifyCheckinTicket(code: string): Promise<{
    success: boolean;
    verified: boolean;
    alreadyCheckedIn?: boolean;
    booking?: any;
    message: string;
  }> {
    const res = await apiClient.post<{
      success: boolean;
      verified: boolean;
      alreadyCheckedIn?: boolean;
      booking?: any;
      message: string;
    }>('/events/tickets/verify-checkin', { code });
    return res.data;
  },
};

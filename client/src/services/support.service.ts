import { apiClient } from './api-client';

export interface SupportMessageItem {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isAdminReply: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'CLUB_QUERY' | 'WEBSITE_BUG' | 'ACCESS_RECOVERY' | 'EVENT_INQUIRY' | 'PAYMENT_ISSUE' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  organizationId: string | null;
  createdById: string;
  assignedToId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  createdBy: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
  assignedTo?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  } | null;
  messages?: SupportMessageItem[];
  _count?: {
    messages: number;
  };
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: 'CLUB_QUERY' | 'WEBSITE_BUG' | 'ACCESS_RECOVERY' | 'EVENT_INQUIRY' | 'PAYMENT_ISSUE' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  organizationId?: string | null;
}

export const supportService = {
  getTickets: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    organizationId?: string;
    search?: string;
  }): Promise<SupportTicketItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: SupportTicketItem[] }>('/support/tickets', {
      params,
    });
    return res.data.data;
  },

  getTicketDetails: async (ticketId: string): Promise<SupportTicketItem> => {
    const res = await apiClient.get<{ success: boolean; data: SupportTicketItem }>(`/support/tickets/${ticketId}`);
    return res.data.data;
  },

  createTicket: async (payload: CreateTicketPayload): Promise<SupportTicketItem> => {
    const res = await apiClient.post<{ success: boolean; data: SupportTicketItem; message: string }>(
      '/support/tickets',
      payload
    );
    return res.data.data;
  },

  replyToTicket: async (ticketId: string, message: string, status?: string): Promise<SupportMessageItem> => {
    const res = await apiClient.post<{ success: boolean; data: SupportMessageItem; message: string }>(
      `/support/tickets/${ticketId}/reply`,
      { message, status }
    );
    return res.data.data;
  },

  updateTicketStatus: async (ticketId: string, status: string): Promise<SupportTicketItem> => {
    const res = await apiClient.patch<{ success: boolean; data: SupportTicketItem; message: string }>(
      `/support/tickets/${ticketId}/status`,
      { status }
    );
    return res.data.data;
  },
};

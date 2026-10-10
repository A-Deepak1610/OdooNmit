import { apiClient } from './api-client';

export interface AdminKpis {
  totalClubs: number;
  activeClubs: number;
  inactiveClubs: number;
  totalUsers: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalElections: number;
  activeElections: number;
}

export interface ClubItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  ticketCount: number;
  electionCount: number;
  president: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  organizationId: string | null;
  createdAt: string;
  resolvedAt: string | null;
  createdBy: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    messages: number;
  };
}

export interface SupportMessageItem {
  id: string;
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

export interface ElectionCandidateItem {
  id: string;
  electionId: string;
  userId: string;
  manifesto: string;
  statementOfPurpose?: string | null;
  experience?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  voteCount: number;
  approvedAt: string | null;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface ElectionItem {
  id: string;
  title: string;
  organizationId: string;
  academicYear: string;
  description: string | null;
  status: 'DRAFT' | 'NOMINATION_OPEN' | 'VOTING_OPEN' | 'COMPLETED' | 'CANCELLED';
  nominationDeadline: string;
  votingStartDate: string;
  votingEndDate: string;
  winnerCandidateId: string | null;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  candidates: ElectionCandidateItem[];
  _count: {
    votes: number;
    candidates: number;
  };
}

export interface DbAssistantResult {
  query: string;
  interpretedIntent: string;
  sqlQuery: string;
  summaryMetrics: Array<{ label: string; value: string }>;
  columns: string[];
  rows: string[][];
}

export const adminService = {
  // 1. Overview
  getOverview: async () => {
    const res = await apiClient.get('/admin/overview');
    return res.data.data;
  },

  // 2. Clubs
  getClubs: async (params?: { search?: string; status?: string; category?: string }) => {
    const res = await apiClient.get<any>('/admin/clubs', { params });
    return res.data.data as ClubItem[];
  },

  createClub: async (data: {
    name: string;
    category?: string;
    description?: string;
    logoUrl?: string;
  }) => {
    const res = await apiClient.post('/admin/clubs', data);
    return res.data.data;
  },

  updateClubStatus: async (clubId: string, isActive: boolean) => {
    const res = await apiClient.patch(`/admin/clubs/${clubId}/status`, { isActive });
    return res.data.data;
  },

  assignPresident: async (clubId: string, userId: string) => {
    const res = await apiClient.post(`/admin/clubs/${clubId}/president`, { userId });
    return res.data.data;
  },

  // 3. Support Tickets
  getTickets: async (params?: { status?: string; category?: string; priority?: string; search?: string }) => {
    const res = await apiClient.get('/admin/tickets', { params });
    return res.data.data as SupportTicketItem[];
  },

  getTicketDetails: async (ticketId: string) => {
    const res = await apiClient.get(`/admin/tickets/${ticketId}`);
    return res.data.data as SupportTicketItem & { messages: SupportMessageItem[] };
  },

  replyTicket: async (ticketId: string, message: string, status?: string) => {
    const res = await apiClient.post(`/admin/tickets/${ticketId}/reply`, { message, status });
    return res.data.data as SupportMessageItem;
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    const res = await apiClient.patch(`/admin/tickets/${ticketId}/status`, { status });
    return res.data.data;
  },

  // 4. Elections
  getElections: async () => {
    const res = await apiClient.get('/admin/elections');
    return res.data.data as ElectionItem[];
  },

  createElection: async (data: {
    title: string;
    organizationId: string;
    academicYear?: string;
    description?: string;
    nominationDeadline: string;
    votingStartDate: string;
    votingEndDate: string;
  }) => {
    const res = await apiClient.post('/admin/elections', data);
    return res.data.data;
  },

  updateCandidateStatus: async (candidateId: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await apiClient.patch(`/admin/elections/candidates/${candidateId}/status`, { status });
    return res.data.data;
  },

  castVote: async (electionId: string, candidateId: string) => {
    const res = await apiClient.post(`/admin/elections/${electionId}/vote`, { candidateId });
    return res.data.data;
  },

  finalizeElection: async (electionId: string) => {
    const res = await apiClient.post(`/admin/elections/${electionId}/finalize`);
    return res.data.data;
  },

  // 5. DB Assistant
  queryDbAssistant: async (query: string) => {
    const res = await apiClient.post('/admin/db-assistant', { query });
    return res.data.data as DbAssistantResult;
  },
};

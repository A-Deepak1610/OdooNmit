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
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  membershipFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
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
  originalQuery?: string;
  correctedQuery?: string;
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

  updateClub: async (
    clubId: string,
    data: {
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
    }
  ) => {
    const res = await apiClient.patch(`/admin/clubs/${clubId}`, data);
    return res.data.data as ClubItem;
  },

  updateClubStatus: async (clubId: string, isActive: boolean) => {
    const res = await apiClient.patch(`/admin/clubs/${clubId}/status`, { isActive });
    return res.data.data;
  },

  assignPresident: async (clubId: string, userId: string | null) => {
    const res = await apiClient.post(`/admin/clubs/${clubId}/president`, { userId });
    return res.data.data;
  },

  getAllUsers: async () => {
    const res = await apiClient.get('/users/all');
    return res.data.data as Array<{
      id: string;
      username: string;
      fullName: string;
      email: string;
      avatarUrl?: string | null;
      roles?: Array<{ role: string; organizationId?: string | null }>;
    }>;
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

  updateElectionStatus: async (electionId: string, status: string) => {
    const res = await apiClient.patch(`/admin/elections/${electionId}/status`, { status });
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
  queryDbAssistant: async (query: string): Promise<DbAssistantResult> => {
    try {
      const directRes = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query.trim() }),
      });
      if (directRes.ok) {
        const data = await directRes.json();
        const results = data.results || [];
        const columns = results.length > 0 ? Object.keys(results[0]) : ['Result'];
        const rows =
          results.length > 0
            ? results.map((r: any) => columns.map((col) => String(r[col] ?? '')))
            : [['No records found']];
        return {
          query: data.question,
          originalQuery: data.original_question || query.trim(),
          correctedQuery: data.corrected_question || data.question,
          interpretedIntent: data.answer,
          sqlQuery: data.sql,
          summaryMetrics: [
            { label: 'Rows Returned', value: `${results.length}` },
            { label: 'Database', value: 'TiDB Cloud MySQL' },
            { label: 'AI Model', value: 'openai/gpt-oss-20b' },
          ],
          columns,
          rows,
        };
      }
    } catch {
      // Fallback to Express backend /admin/db-assistant
    }
    const res = await apiClient.post('/admin/db-assistant', { query });
    return res.data.data as DbAssistantResult;
  },

  // 6. Central Announcements
  getAnnouncements: async () => {
    const res = await apiClient.get('/admin/announcements');
    return res.data.data;
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    category?: string;
    organizationId?: string;
    isPinned?: boolean;
    isMemberOnly?: boolean;
  }) => {
    const res = await apiClient.post('/admin/announcements', data);
    return res.data.data;
  },

  updateAnnouncement: async (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      category: string;
      isPinned: boolean;
      isMemberOnly: boolean;
    }>
  ) => {
    const res = await apiClient.patch(`/admin/announcements/${id}`, data);
    return res.data.data;
  },

  deleteAnnouncement: async (id: string) => {
    const res = await apiClient.delete(`/admin/announcements/${id}`);
    return res.data;
  },
};

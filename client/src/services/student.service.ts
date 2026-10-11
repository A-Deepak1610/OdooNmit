import { apiClient } from './api-client';

export interface StudentNotificationItem {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface StudentClubItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  president: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  isMember: boolean;
  applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  application: {
    id: string;
    statementOfPurpose: string | null;
    experience: string | null;
    department: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  } | null;
}

export interface StudentCandidateItem {
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
    avatarUrl: string | null;
  };
}

export interface StudentElectionItem {
  id: string;
  title: string;
  academicYear: string;
  description: string | null;
  status: 'NOMINATION_OPEN' | 'VOTING_OPEN' | 'COMPLETED' | 'DRAFT';
  nominationDeadline: string;
  votingStartDate: string;
  votingEndDate: string;
  organization: {
    id: string;
    name: string;
    logoUrl: string | null;
    category: string | null;
  };
  candidates: StudentCandidateItem[];
  hasVoted: boolean;
  votedCandidateId: string | null;
  myNomination: StudentCandidateItem | null;
  winnerCandidateId?: string | null;
}

export class StudentService {
  /**
   * 1. Notifications
   */
  async getNotifications(): Promise<{ notifications: StudentNotificationItem[]; unreadCount: number }> {
    const res = await apiClient.get<{ success: boolean; data: { notifications: StudentNotificationItem[]; unreadCount: number } }>(
      '/student/notifications'
    );
    return res.data.data;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await apiClient.patch(`/student/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.post('/student/notifications/read-all');
  }

  /**
   * 2. Clubs & Membership
   */
  async getClubs(): Promise<StudentClubItem[]> {
    const res = await apiClient.get<{ success: boolean; data: StudentClubItem[] }>('/student/clubs');
    return res.data.data;
  }

  async applyMembership(
    organizationId: string,
    data: {
      statementOfPurpose: string;
      experience: string;
      department?: string;
      semester?: string;
    }
  ): Promise<any> {
    const res = await apiClient.post(`/student/clubs/${organizationId}/apply`, data);
    return res.data;
  }

  /**
   * 3. Elections, Nominations & Voting
   */
  async getElections(): Promise<StudentElectionItem[]> {
    const res = await apiClient.get<{ success: boolean; data: StudentElectionItem[] }>('/student/elections');
    return res.data.data;
  }

  async applyNomination(
    electionId: string,
    data: {
      statementOfPurpose: string;
      experience: string;
      manifesto: string;
    }
  ): Promise<any> {
    const res = await apiClient.post(`/student/elections/${electionId}/nominate`, data);
    return res.data;
  }

  async castVote(electionId: string, candidateId: string): Promise<any> {
    const res = await apiClient.post(`/student/elections/${electionId}/vote`, { candidateId });
    return res.data;
  }

  /**
   * 4. Member Dues Status & Renewal Alert
   */
  async getMyMembershipStatus(): Promise<MembershipDuesStatus> {
    const res = await apiClient.get<{ success: boolean; data: MembershipDuesStatus }>('/student/membership/my-status');
    return res.data.data;
  }

  async renewMembership(): Promise<{
    success: boolean;
    validUntil: string;
    duesPaid: boolean;
    amountINR: number;
    message: string;
  }> {
    const res = await apiClient.post<{
      success: boolean;
      validUntil: string;
      duesPaid: boolean;
      amountINR: number;
      message: string;
    }>('/student/membership/renew');
    return res.data;
  }
}

export interface MembershipDuesStatus {
  hasMembership: boolean;
  role?: string;
  assignedAt?: string;
  validUntil?: string | null;
  duesPaid?: boolean;
  daysRemaining?: number | null;
  duesStatus?: 'ACTIVE' | 'EXPIRING_SOON' | 'UPCOMING' | 'OVERDUE';
  duesAmountINR?: number;
  hasAlert?: boolean;
  club?: {
    id: string;
    name: string;
    slug: string;
    category?: string;
    logoUrl?: string;
    membershipFeeINR: number;
  };
  alert?: {
    hasAlert: boolean;
    severity: 'success' | 'warning' | 'danger';
    duesStatus: string;
    daysRemaining?: number;
    duesAmountINR: number;
    title: string;
    message: string;
  } | null;
}

export const studentService = new StudentService();

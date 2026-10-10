import { apiClient } from './api-client';

export interface PresidentClubProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  membershipFee: number;
  membershipFeeINR: string;
  isActive: boolean;
}

export interface PresidentAnnouncement {
  id: string;
  organizationId: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isMemberOnly: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    username?: string;
  };
}

export interface PresidentMember {
  roleId: string;
  userId: string;
  role: 'PRESIDENT' | 'TREASURER' | 'EVENT_ORGANIZER' | 'VOLUNTEER' | 'MEMBER' | 'STUDENT';
  assignedAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: string;
  };
}

export interface PresidentApplication {
  id: string;
  organizationId: string;
  userId: string;
  statementOfPurpose: string | null;
  experience: string | null;
  department: string | null;
  semester: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt: string | null;
  reviewedById: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

export interface PresidentDashboardData {
  club: PresidentClubProfile;
  stats: {
    totalMembers: number;
    roleBreakdown: {
      PRESIDENT: number;
      TREASURER: number;
      EVENT_ORGANIZER: number;
      VOLUNTEER: number;
      MEMBER: number;
    };
    pendingApplicationsCount: number;
    totalAnnouncements: number;
    membershipFeeINR: string;
  };
  recentApplications: PresidentApplication[];
  recentAnnouncements: PresidentAnnouncement[];
}

export const presidentService = {
  // 1. Dashboard Overview
  async getOverview(): Promise<PresidentDashboardData> {
    const res = await apiClient.get<{ success: boolean; data: PresidentDashboardData }>('/president/overview');
    return res.data.data;
  },

  // 2. Club Profile
  async getProfile(): Promise<PresidentClubProfile> {
    const res = await apiClient.get<{ success: boolean; data: PresidentClubProfile }>('/president/profile');
    return res.data.data;
  },

  async updateProfile(data: Partial<PresidentClubProfile>): Promise<PresidentClubProfile> {
    const res = await apiClient.patch<{ success: boolean; data: PresidentClubProfile; message: string }>(
      '/president/profile',
      data
    );
    return res.data.data;
  },

  // 3. Announcements
  async getAnnouncements(): Promise<PresidentAnnouncement[]> {
    const res = await apiClient.get<{ success: boolean; data: PresidentAnnouncement[] }>('/president/announcements');
    return res.data.data;
  },

  async createAnnouncement(data: {
    title: string;
    content: string;
    category?: string;
    isPinned?: boolean;
    isMemberOnly?: boolean;
  }): Promise<PresidentAnnouncement> {
    const res = await apiClient.post<{ success: boolean; data: PresidentAnnouncement; message: string }>(
      '/president/announcements',
      data
    );
    return res.data.data;
  },

  async updateAnnouncement(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      isPinned?: boolean;
      isMemberOnly?: boolean;
    }
  ): Promise<PresidentAnnouncement> {
    const res = await apiClient.patch<{ success: boolean; data: PresidentAnnouncement; message: string }>(
      `/president/announcements/${id}`,
      data
    );
    return res.data.data;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    await apiClient.delete(`/president/announcements/${id}`);
  },

  // 4. Membership Fee
  async updateMembershipFee(feeINR: number): Promise<{ membershipFee: number; membershipFeeINR: number }> {
    const res = await apiClient.patch<{ success: boolean; data: { membershipFee: number; membershipFeeINR: number }; message: string }>(
      '/president/membership-fee',
      { feeINR }
    );
    return res.data.data;
  },

  // 5. Members
  async getMembers(): Promise<PresidentMember[]> {
    const res = await apiClient.get<{ success: boolean; data: PresidentMember[] }>('/president/members');
    return res.data.data;
  },

  async assignMemberRole(memberUserId: string, role: string): Promise<void> {
    await apiClient.patch(`/president/members/${memberUserId}/role`, { role });
  },

  async removeMember(memberUserId: string): Promise<void> {
    await apiClient.delete(`/president/members/${memberUserId}`);
  },

  // 6. Applications
  async getApplications(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<PresidentApplication[]> {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient.get<{ success: boolean; data: PresidentApplication[] }>(`/president/applications${query}`);
    return res.data.data;
  },

  async reviewApplication(id: string, status: 'APPROVED' | 'REJECTED'): Promise<PresidentApplication> {
    const res = await apiClient.patch<{ success: boolean; data: PresidentApplication; message: string }>(
      `/president/applications/${id}/review`,
      { status }
    );
    return res.data.data;
  },
};

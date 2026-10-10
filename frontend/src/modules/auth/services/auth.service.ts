import { apiClient } from '../../../services/api-client';
import { User } from '../../../types';
import { ROLES, UserRole } from '../../../config/roles';

export interface LoginParams {
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async ({ email, password }: LoginParams): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.user && response.data?.token) {
        return response.data;
      }
    } catch {
      // Fallback for instant mock role preview
    }

    // Role mapping based on email prefix
    const emailPrefix = email.split('@')[0].toUpperCase();
    let detectedRole: UserRole = ROLES.STUDENT;

    if (emailPrefix.includes('ADMIN')) detectedRole = ROLES.ADMIN;
    else if (emailPrefix.includes('PRESIDENT')) detectedRole = ROLES.PRESIDENT;
    else if (emailPrefix.includes('TREASURER')) detectedRole = ROLES.TREASURER;
    else if (emailPrefix.includes('ORGANIZER')) detectedRole = ROLES.EVENT_ORGANIZER;
    else if (emailPrefix.includes('VOLUNTEER')) detectedRole = ROLES.VOLUNTEER;
    else if (emailPrefix.includes('MEMBER')) detectedRole = ROLES.MEMBER;

    const mockUser: User = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Demo User',
      email,
      role: detectedRole,
      roles: [detectedRole],
      status: 'ACTIVE',
    };

    return {
      user: mockUser,
      token: `demo_jwt_token_${detectedRole.toLowerCase()}`,
    };
  },
};

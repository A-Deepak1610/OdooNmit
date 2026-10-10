import { apiClient } from '../../../services/api-client';
import { User } from '../../../types';

export interface LoginParams {
  identifier?: string;
  email?: string;
  password?: string;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export const authService = {
  /**
   * Username / Email + Password login to backend
   */
  login: async ({ identifier, email, password }: LoginParams): Promise<{ user: User; token: string }> => {
    const loginIdentifier = (identifier || email || '').trim();
    const response = await apiClient.post<AuthApiResponse>('/auth/login', {
      identifier: loginIdentifier,
      password: password || 'Student@123',
    });

    if (response.data?.success && response.data?.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.accessToken,
      };
    }

    throw new Error(response.data?.message || 'Login failed');
  },

  /**
   * Google ID Token verification login
   */
  loginWithGoogle: async (idToken: string): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<AuthApiResponse>('/auth/google', { idToken });

    if (response.data?.success && response.data?.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.accessToken,
      };
    }

    throw new Error(response.data?.message || 'Google login failed');
  },

  /**
   * Refresh session using server-side database refresh token
   */
  refreshToken: async (): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<AuthApiResponse>('/auth/refresh');
    if (response.data?.success && response.data?.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.accessToken,
      };
    }
    throw new Error('Refresh failed');
  },

  /**
   * End session and revoke tokens
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },
};

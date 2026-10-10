import { create } from 'zustand';
import { User } from '../types';
import { UserRole, getDefaultRole, ROLES } from '../config/roles';
import { apiClient } from '../services/api-client';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  userId: string | null;
  role: UserRole | null;
  roles: UserRole[];
  status: AuthStatus;
  token: string | null;
  collegeName: string;
  error: string | null;

  // Actions
  setAuthSession: (params: { user: User; token: string; refreshToken?: string }) => void;
  setUser: (user: User, token?: string) => void;
  updateUser: (partial: Partial<User>) => void;
  switchRole: (role: UserRole) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setError: (err: string | null) => void;
}

const TOKEN_KEY = 'campusmitra_access_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userId: null,
  role: null,
  roles: [],
  status: 'idle',
  token: null,
  collegeName: 'Dr.SNS Rajalakshmi College Of Arts and Science',
  error: null,

  setAuthSession: ({ user, token }) => {
    const userRoles = (user.roles || [ROLES.STUDENT]) as UserRole[];
    const activeRole = user.role || user.activeRole || getDefaultRole(userRoles);

    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage access check
    }

    set({
      user: { ...user, role: activeRole, roles: userRoles },
      userId: user.id,
      role: activeRole,
      roles: userRoles,
      status: 'authenticated',
      token,
      error: null,
    });
  },

  setUser: (user, token) => {
    get().setAuthSession({ user, token: token || 'dev-token' });
  },

  updateUser: (partial) =>
    set((state) => {
      if (!state.user) return state;
      const updatedUser: User = { ...state.user, ...partial };
      return {
        user: updatedUser,
        userId: updatedUser.id,
      };
    }),

  switchRole: (newRole) => {
    const { roles, user } = get();
    if (!roles.includes(newRole)) {
      console.warn(`User does not have permission to switch to role: ${newRole}`);
      return;
    }

    set({
      role: newRole,
      user: user ? { ...user, role: newRole } : null,
    });
  },

  clearAuth: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore
    }

    set({
      user: null,
      userId: null,
      role: null,
      roles: [],
      status: 'unauthenticated',
      token: null,
      error: null,
    });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout revocation warning:', err);
    } finally {
      get().clearAuth();
    }
  },

  initializeAuth: async () => {
    set({ status: 'loading' });

    let storedToken: string | null = null;
    try {
      storedToken = sessionStorage.getItem(TOKEN_KEY);
    } catch {
      // Ignore
    }

    if (!storedToken) {
      set({ status: 'unauthenticated' });
      return;
    }

    set({ token: storedToken });

    try {
      const response = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
      const backendUser = response.data?.data?.user;

      if (!backendUser) {
        throw new Error('User not found');
      }

      const userRoles = (backendUser.roles || [ROLES.STUDENT]) as UserRole[];
      const activeRole = backendUser.role || backendUser.activeRole || getDefaultRole(userRoles);

      set({
        user: { ...backendUser, role: activeRole, roles: userRoles },
        userId: backendUser.id,
        role: activeRole,
        roles: userRoles,
        status: 'authenticated',
        error: null,
      });
    } catch {
      // Access token expired, attempt server-side database refresh token validation
      try {
        const refreshRes = await apiClient.post<{
          success: boolean;
          data: { accessToken: string; user: User };
        }>('/auth/refresh');

        const { accessToken, user } = refreshRes.data.data;
        get().setAuthSession({ user, token: accessToken });
      } catch {
        get().clearAuth();
      }
    }
  },

  setError: (error) => set({ error }),
}));

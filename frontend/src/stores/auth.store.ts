import { create } from 'zustand';
import { User } from '../types';
import { UserRole, getDefaultRole, ROLES } from '../config/roles';
import { apiClient } from '../services/api-client';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  userId: string | null;
  role: UserRole | null; // Currently active workspace role
  roles: UserRole[]; // All roles assigned to user
  status: AuthStatus;
  token: string | null;
  refreshToken: string | null;
  collegeName: string;
  error: string | null;

  // Actions
  setAuthSession: (params: { user: User; token: string; refreshToken?: string }) => void;
  updateUser: (partial: Partial<User>) => void;
  switchRole: (role: UserRole) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setError: (err: string | null) => void;
}

const TOKEN_KEY = 'campusmitra_access_token';
const REFRESH_KEY = 'campusmitra_refresh_token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userId: null,
  role: null,
  roles: [],
  status: 'idle',
  token: null,
  refreshToken: null,
  collegeName: 'Dr.SNS Rajalakshmi College Of Arts and Science',
  error: null,

  setAuthSession: ({ user, token, refreshToken }) => {
    const userRoles = (user.roles || [ROLES.STUDENT]) as UserRole[];
    const activeRole = user.role || getDefaultRole(userRoles);

    // Persist tokens across page reloads during active browser session
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
    } catch {
      // Ignore storage restrictions if in private mode
    }

    set({
      user: { ...user, role: activeRole, roles: userRoles },
      userId: user.id,
      role: activeRole,
      roles: userRoles,
      status: 'authenticated',
      token,
      refreshToken: refreshToken || null,
      error: null,
    });
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
      sessionStorage.removeItem(REFRESH_KEY);
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
      refreshToken: null,
      error: null,
    });
  },

  logout: async () => {
    const { refreshToken, clearAuth } = get();
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Backend logout revocation warning:', err);
    } finally {
      clearAuth();
    }
  },

  initializeAuth: async () => {
    set({ status: 'loading' });

    let storedToken: string | null = null;
    let storedRefresh: string | null = null;

    try {
      storedToken = sessionStorage.getItem(TOKEN_KEY);
      storedRefresh = sessionStorage.getItem(REFRESH_KEY);
    } catch {
      // Ignore
    }

    if (!storedToken) {
      set({ status: 'unauthenticated' });
      return;
    }

    // Set token in state so apiClient interceptor picks it up
    set({ token: storedToken, refreshToken: storedRefresh });

    try {
      // Strictly verify session against backend /auth/me - do not trust local state alone!
      const response = await apiClient.get<{ status: string; data: { user: User } }>('/auth/me');
      const backendUser = response.data.data.user;

      const userRoles = (backendUser.roles || [ROLES.STUDENT]) as UserRole[];
      const activeRole = getDefaultRole(userRoles);

      set({
        user: { ...backendUser, role: activeRole, roles: userRoles },
        userId: backendUser.id,
        role: activeRole,
        roles: userRoles,
        status: 'authenticated',
        error: null,
      });
    } catch (err) {
      // If token expired, attempt rotation using refresh token if available
      if (storedRefresh) {
        try {
          const refreshRes = await apiClient.post<{
            status: string;
            data: { accessToken: string; refreshToken: string; user: User };
          }>('/auth/refresh', { refreshToken: storedRefresh });

          const { accessToken, refreshToken: newRefresh, user } = refreshRes.data.data;
          get().setAuthSession({ user, token: accessToken, refreshToken: newRefresh });
          return;
        } catch {
          // Both access and refresh tokens failed
        }
      }

      get().clearAuth();
    }
  },

  setError: (error) => set({ error }),
}));

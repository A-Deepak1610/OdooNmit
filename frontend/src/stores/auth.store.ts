import { create } from 'zustand';
import { User } from '../types';
import { UserRole } from '../config/roles';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  userId: string | null;
  username: string | null;
  role: UserRole | null;
  status: AuthStatus;
  token: string | null;

  // Actions
  setUser: (user: User, token?: string) => void;
  updateUser: (partial: Partial<User>) => void;
  setRole: (role: UserRole | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userId: null,
  username: null,
  role: null,
  status: 'unauthenticated',
  token: null,

  setUser: (user, token) =>
    set({
      user,
      userId: user.id,
      username: user.username,
      role: user.role,
      status: 'authenticated',
      token: token || null,
    }),

  updateUser: (partial) =>
    set((state) => {
      if (!state.user) return state;
      const updatedUser: User = { ...state.user, ...partial };
      return {
        user: updatedUser,
        userId: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
      };
    }),

  setRole: (role) =>
    set((state) => ({
      role,
      user: state.user ? { ...state.user, role: role || '' } : null,
    })),

  clearUser: () =>
    set({
      user: null,
      userId: null,
      username: null,
      role: null,
      status: 'unauthenticated',
      token: null,
    }),
}));

import { create } from 'zustand';

export type NotificationCategory =
  | 'ALL'
  | 'UNREAD'
  | 'ELECTION'
  | 'FINANCE'
  | 'EVENT'
  | 'VOLUNTEER'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  category: 'ELECTION' | 'FINANCE' | 'EVENT' | 'VOLUNTEER' | 'ANNOUNCEMENT' | 'SYSTEM';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  targetUrl: string;
  read: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: CampusNotification[];
  unreadCount: number;
  isLoading: boolean;
  activeFilter: NotificationCategory;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  addNotification: (notif: {
    title: string;
    message: string;
    category?: 'ELECTION' | 'FINANCE' | 'EVENT' | 'VOLUNTEER' | 'ANNOUNCEMENT' | 'SYSTEM';
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
    targetUrl?: string;
  }) => void;
  setActiveFilter: (filter: NotificationCategory) => void;
}

const INITIAL_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-1',
    title: 'Officer Elections Voting is Live!',
    message: 'Cast your ballot for Club President, Treasurer, and Secretary. Single-ballot verification active.',
    category: 'ELECTION',
    priority: 'HIGH',
    targetUrl: '/voting',
    read: false,
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Annual Membership Dues Pending',
    message: 'Renew your annual dues (₹250) to maintain voter eligibility and member discounts.',
    category: 'FINANCE',
    priority: 'HIGH',
    targetUrl: '/student/memberships',
    read: false,
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Spring Gala 2026 Passes Released',
    message: 'Early Bird passes are 85% claimed. Digital QR pass delivered upon payment checkout.',
    category: 'EVENT',
    priority: 'NORMAL',
    targetUrl: '/student/events',
    read: false,
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'Volunteer Task Assigned',
    message: 'You have been assigned to "Manage Check-In Desk & Badge Printing" for the upcoming expo.',
    category: 'VOLUNTEER',
    priority: 'NORMAL',
    targetUrl: '/volunteer/tasks',
    read: true,
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'Reimbursement Approved: ₹420',
    message: 'Treasurer cleared reimbursement for Poster Printing Supplies. Bank payout scheduled.',
    category: 'FINANCE',
    priority: 'NORMAL',
    targetUrl: '/student/expenses',
    read: true,
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.read).length,
  isLoading: false,
  activeFilter: 'ALL',

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/notifications`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          set({
            notifications: data.notifications,
            unreadCount: data.unreadCount ?? data.notifications.filter((n: CampusNotification) => !n.read).length,
          });
        }
      }
    } catch (_err) {
      // Keep local state on network error
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic local update
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/notifications/${id}/read`, { method: 'PATCH' });
    } catch (_err) {
      // Local state is already updated
    }
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({
      notifications: updated,
      unreadCount: 0,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/notifications/mark-all-read`, { method: 'POST' });
    } catch (_err) {
      // Local state is already updated
    }
  },

  dismissNotification: async (id: string) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      await fetch(`${apiUrl}/notifications/${id}`, { method: 'DELETE' });
    } catch (_err) {
      // Local state is already updated
    }
  },

  addNotification: (notif) => {
    const newEntry: CampusNotification = {
      id: `notif-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      category: notif.category || 'SYSTEM',
      priority: notif.priority || 'NORMAL',
      targetUrl: notif.targetUrl || '/',
      read: false,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...get().notifications];
    set({
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    });
  },

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },
}));

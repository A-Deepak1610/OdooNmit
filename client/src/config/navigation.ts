import { NavigationItem } from '../types';
import { ROLES, UserRole } from './roles';
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  UserCheck,
  Ticket,
  ShoppingBag,
  CheckSquare,
  Receipt,
  Users,
  DollarSign,
  PieChart,
  Settings,
  History,
  Building2,
  ShieldCheck,
  QrCode,
  Vote,
  Database,
} from 'lucide-react';

/**
 * Role-specific navigation registry.
 * Defines all navigation sections and items per role strictly aligned with role responsibilities.
 */
export const navigationConfig: NavigationItem[] = [
  // ===========================================================================
  // 6. STUDENT ROLE NAVIGATION
  // Strictly scoped to user specification:
  // - Browse organizations, events, announcements, and merchandise.
  // - Register for an organization and pay membership dues.
  // - View membership status, expiry date, and benefits.
  // - Renew membership.
  // - Buy event tickets and merchandise.
  // - Access ticket confirmations or QR codes.
  // - View order and payment status.
  // - View member-only announcements and applicable discounts.
  // ===========================================================================
  {
    id: 'student-dashboard',
    label: 'Student Services Hub',
    path: '/student/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.STUDENT],
    group: 'MAIN',
  },
  {
    id: 'student-organizations',
    label: 'Browse Organizations',
    path: '/student/organizations',
    icon: Building2,
    allowedRoles: [ROLES.STUDENT],
    group: 'DISCOVER & BROWSE',
  },
  {
    id: 'student-events',
    label: 'Browse Events & Tickets',
    path: '/student/events',
    icon: Calendar,
    allowedRoles: [ROLES.STUDENT],
    group: 'DISCOVER & BROWSE',
  },
  {
    id: 'student-announcements',
    label: 'Announcements & Discounts',
    path: '/student/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.STUDENT],
    group: 'DISCOVER & BROWSE',
  },
  {
    id: 'student-merchandise',
    label: 'Merchandise Store',
    path: '/student/merchandise',
    icon: ShoppingBag,
    allowedRoles: [ROLES.STUDENT],
    group: 'DISCOVER & BROWSE',
  },
  {
    id: 'student-membership',
    label: 'Membership, Expiry & Renewal',
    path: '/student/membership',
    icon: UserCheck,
    allowedRoles: [ROLES.STUDENT],
    group: 'MEMBERSHIP & PERKS',
  },
  {
    id: 'student-tickets',
    label: 'Ticket Confirmations & QR Passes',
    path: '/student/tickets',
    icon: Ticket,
    allowedRoles: [ROLES.STUDENT],
    group: 'MY ACTIVITY',
  },
  {
    id: 'student-orders',
    label: 'Order & Payment Status',
    path: '/student/orders',
    icon: Receipt,
    allowedRoles: [ROLES.STUDENT],
    group: 'MY ACTIVITY',
  },

  // Member Hub
  {
    id: 'member-dashboard',
    label: 'Member Dashboard',
    path: '/member/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.MEMBER],
    group: 'MAIN',
  },
  {
    id: 'member-tickets',
    label: 'My Tickets & QR Passes',
    path: '/member/tickets',
    icon: Ticket,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-membership',
    label: 'My Membership & Renewal',
    path: '/member/membership',
    icon: UserCheck,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-merchandise',
    label: 'Merchandise & Orders',
    path: '/member/merchandise',
    icon: ShoppingBag,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-announcements',
    label: 'Member Announcements',
    path: '/member/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-elections',
    label: 'Officer Elections & Voting',
    path: '/member/elections',
    icon: Vote,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },

  // ===========================================================================
  // 5. VOLUNTEER NAVIGATION
  // Assigned tasks & deadlines; update progress; event duties; submit reimbursements;
  // track status; check tickets if granted.
  // ===========================================================================
  {
    id: 'volunteer-dashboard',
    label: 'Operations Hub',
    path: '/volunteer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'MAIN',
  },
  {
    id: 'volunteer-tasks',
    label: 'Fundraiser Tasks',
    path: '/volunteer/tasks',
    icon: CheckSquare,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-events',
    label: 'Event Duties & Instructions',
    path: '/volunteer/events',
    icon: Calendar,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-expenses',
    label: 'Reimbursement Claims',
    path: '/volunteer/expenses',
    icon: Receipt,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-scanner',
    label: 'Ticket & Member Check-in',
    path: '/volunteer/scanner',
    icon: QrCode,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-profile',
    label: 'Volunteer Pass & ID',
    path: '/volunteer/profile',
    icon: UserCheck,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'CREDENTIALS',
  },

  // ===========================================================================
  // 4. EVENT ORGANIZER NAVIGATION
  // Create events, set member/non-member prices, monitor capacity,
  // scan tickets & prevent duplicates, verify membership, view revenue.
  // ===========================================================================
  {
    id: 'organizer-dashboard',
    label: 'Organizer Console',
    path: '/organizer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'MAIN',
  },
  {
    id: 'organizer-events',
    label: 'Events & Ticket Quotas',
    path: '/organizer/events',
    icon: Calendar,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-scanner',
    label: 'Door Ticket Scanner',
    path: '/volunteer/scanner',
    icon: QrCode,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-attendees',
    label: 'Attendance & Revenue',
    path: '/organizer/attendees',
    icon: Users,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-tasks',
    label: 'Logistics Tasks',
    path: '/organizer/tasks',
    icon: CheckSquare,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },

  // ===========================================================================
  // 3. TREASURER NAVIGATION
  // Track dues, tickets, merch, fundraisers; categorize expenses;
  // review receipts; approve/reject reimbursements; closing balance reports.
  // ===========================================================================
  {
    id: 'treasurer-dashboard',
    label: 'Financial Ledger',
    path: '/treasurer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.TREASURER],
    group: 'MAIN',
  },
  {
    id: 'treasurer-transactions',
    label: 'Income & Expense Journal',
    path: '/treasurer/transactions',
    icon: DollarSign,
    allowedRoles: [ROLES.TREASURER],
    group: 'FINANCE & BUDGET',
  },
  {
    id: 'treasurer-reimbursements',
    label: 'Reimbursement Audit',
    path: '/treasurer/reimbursements',
    icon: Receipt,
    allowedRoles: [ROLES.TREASURER],
    group: 'FINANCE & BUDGET',
  },
  {
    id: 'treasurer-reports',
    label: 'Semester Closing Reports',
    path: '/treasurer/reports',
    icon: PieChart,
    allowedRoles: [ROLES.TREASURER],
    group: 'FINANCE & BUDGET',
  },

  // ===========================================================================
  // 2. CLUB PRESIDENT / ORGANIZATION ADMIN NAVIGATION
  // Oversees activities & leadership; profile/website; announcements;
  // events/merch/fundraisers; membership/attendance; assign duties; finance summary.
  // ===========================================================================
  {
    id: 'president-dashboard',
    label: 'Executive Suite',
    path: '/president/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'MAIN',
  },
  {
    id: 'president-members',
    label: 'Membership Oversight',
    path: '/president/members',
    icon: Users,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'CLUB GOVERNANCE',
  },
  {
    id: 'president-events',
    label: 'Events & Fundraisers',
    path: '/president/events',
    icon: Calendar,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'CLUB GOVERNANCE',
  },
  {
    id: 'president-announcements',
    label: 'Official Announcements',
    path: '/president/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'COMMUNICATIONS',
  },
  {
    id: 'president-finance',
    label: 'Financial Summaries',
    path: '/president/finance',
    icon: DollarSign,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'FINANCIAL OVERSIGHT',
  },
  {
    id: 'president-elections',
    label: 'Officer Elections & Results',
    path: '/president/elections',
    icon: Vote,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'CLUB GOVERNANCE',
  },

  // ===========================================================================
  // 1. SUPER ADMIN / SYSTEM ADMINISTRATOR NAVIGATION
  // Strictly scoped to user specification:
  // - Quick Overview
  // - Club Management (12)
  // - Ticket Support (4 Open)
  // - Annual Elections (3)
  // - DB Query Assistant (NLP)
  // ===========================================================================
  {
    id: 'admin-overview',
    label: 'Quick Overview',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.ADMIN],
    group: 'SUPER ADMIN',
  },
  {
    id: 'admin-clubs',
    label: 'Club Management',
    path: '/admin/clubs',
    icon: Building2,
    allowedRoles: [ROLES.ADMIN],
    group: 'SUPER ADMIN',
    badge: '12',
  },
  {
    id: 'admin-tickets',
    label: 'Ticket Support',
    path: '/admin/tickets',
    icon: Ticket,
    allowedRoles: [ROLES.ADMIN],
    group: 'SUPER ADMIN',
    badge: '4 Open',
  },
  {
    id: 'admin-elections',
    label: 'Annual Elections',
    path: '/admin/elections',
    icon: Vote,
    allowedRoles: [ROLES.ADMIN],
    group: 'SUPER ADMIN',
    badge: '3',
  },
  {
    id: 'admin-assistant',
    label: 'DB Query Assistant',
    path: '/admin/assistant',
    icon: Database,
    allowedRoles: [ROLES.ADMIN],
    group: 'SUPER ADMIN',
    badge: 'NLP',
  },
];

/**
 * Filters navigation items for the currently active role workspace.
 */
export function getPermittedNavigationItems(activeRole?: UserRole | null): NavigationItem[] {
  if (!activeRole) return [];
  return navigationConfig.filter(
    (item) => item.allowedRoles && item.allowedRoles.includes(activeRole)
  );
}

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
  PieChart,
  Building2,
  QrCode,
  Vote,
  Database,
  Bell,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Wallet,
  Package,
  DollarSign,
  HelpCircle,
} from 'lucide-react';

/**
 * Role-specific navigation registry.
 * Defines all navigation sections and items per role strictly aligned with role responsibilities.
 */
export const navigationConfig: NavigationItem[] = [
  // ===========================================================================
  // 6. STUDENT ROLE NAVIGATION
  // Strictly scoped to user specification:
  // - Student Hub Overview
  // - Campus Clubs & Membership (Apply for membership with statement of purpose & experience)
  // - Annual Elections & Voting (Vote in elections & Apply for Club President)
  // - Campus Notifications (Dedicated screen to read all broadcasts & notices)
  // ===========================================================================
  {
    id: 'student-dashboard',
    label: 'Student Hub',
    path: '/student/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.STUDENT],
  },
  {
    id: 'student-clubs',
    label: 'Campus Clubs & Membership',
    path: '/student/clubs',
    icon: Building2,
    allowedRoles: [ROLES.STUDENT],
    badge: '12',
  },
  {
    id: 'student-elections',
    label: 'Annual Elections & Voting',
    path: '/student/elections',
    icon: Vote,
    allowedRoles: [ROLES.STUDENT],
    badge: 'Active',
  },
  {
    id: 'student-notifications',
    label: 'Campus Notifications',
    path: '/student/notifications',
    icon: Bell,
    allowedRoles: [ROLES.STUDENT],
    badge: 'Notice',
  },
  {
    id: 'student-events',
    label: 'Events & Ticket Passes',
    path: '/student/events',
    icon: Calendar,
    allowedRoles: [ROLES.STUDENT],
    badge: 'Events',
  },
  {
    id: 'student-merchandise',
    label: 'Campus Merchandise & Store',
    path: '/student/merchandise',
    icon: ShoppingBag,
    allowedRoles: [ROLES.STUDENT],
    badge: 'Store',
  },
  {
    id: 'student-announcements',
    label: 'Club & Campus Bulletins',
    path: '/student/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.STUDENT],
    badge: 'Notices',
  },
  {
    id: 'student-support',
    label: 'Help & Support Desk',
    path: '/student/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.STUDENT],
    badge: 'Queries',
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
    id: 'member-events',
    label: 'Events & Ticket Passes',
    path: '/member/events',
    icon: Calendar,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-tickets',
    label: 'My Booked Passes & QR',
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
  {
    id: 'member-support',
    label: 'Help & Support Desk',
    path: '/member/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
    badge: 'Queries',
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
  {
    id: 'volunteer-support',
    label: 'Help & Support Desk',
    path: '/volunteer/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'CREDENTIALS',
    badge: 'Queries',
  },

  // ===========================================================================
  // 4. EVENT ORGANIZER NAVIGATION
  // Tickets & quotas, Mapbox analytics, revenue & fee collections,
  // volunteer squad management, and event-day live check-in analysis.
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
    label: 'Events & Ticket Details',
    path: '/organizer/events',
    icon: Ticket,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-analytics',
    label: 'Demographic & Mapbox Analytics',
    path: '/organizer/analytics',
    icon: PieChart,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-revenue',
    label: 'Fee Collection & Revenue',
    path: '/organizer/revenue',
    icon: DollarSign,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-volunteers',
    label: 'Volunteer Squad Delegation',
    path: '/organizer/volunteers',
    icon: Users,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-checkin',
    label: 'Event Day Live Check-in',
    path: '/organizer/checkin',
    icon: UserCheck,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
    badge: 'Live',
  },
  {
    id: 'organizer-support',
    label: 'Help & Support Desk',
    path: '/organizer/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
    badge: 'Queries',
  },
  {
    id: 'organizer-broadcast-announcement',
    label: 'Broadcast Email Announcement',
    path: '/organizer/broadcast-announcement',
    icon: Megaphone,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-support',
    label: 'Help \u0026 Support Desk',
    path: '/organizer/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
    badge: 'Queries',
  },

  // ===========================================================================
  // 3. TREASURER NAVIGATION
  // Responsible for club finances, records, and reimbursements:
  // - Track membership dues, ticket sales, merchandise income, and fundraiser income.
  // - Record and categorize expenses.
  // - Review reimbursement requests and attached receipts.
  // - Approve or reject reimbursements and record payouts.
  // - View income, expenses, and current balance.
  // - Generate semester financial reports.
  // - Review payment records and financial audit history.
  // ==============================================
  
  {
    id: 'treasurer-dashboard',
    label: 'Treasury Overview',
    path: '/treasurer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.TREASURER],
  },
  {
    id: 'treasurer-dues',
    label: 'Dues',
    path: '/treasurer/dues',
    icon: Wallet,
    allowedRoles: [ROLES.TREASURER],
  },
  {
    id: 'treasurer-merchandise',
    label: 'Merchandise',
    path: '/treasurer/merchandise',
    icon: Package,
    allowedRoles: [ROLES.TREASURER],
  },
  {
    id: 'treasurer-income',
    label: 'Income Tracker',
    path: '/treasurer/income',
    icon: TrendingUp,
    allowedRoles: [ROLES.TREASURER],
    badge: '4 Streams',
  },
  {
    id: 'treasurer-expenses',
    label: 'Expense Journal',
    path: '/treasurer/expenses',
    icon: CreditCard,
    allowedRoles: [ROLES.TREASURER],
  },
  {
    id: 'treasurer-reimbursements',
    label: 'Reimbursements & Receipts',
    path: '/treasurer/reimbursements',
    icon: Receipt,
    allowedRoles: [ROLES.TREASURER],
    badge: '1 Pending',
  },
  {
    id: 'treasurer-reports',
    label: 'Semester Reports',
    path: '/treasurer/reports',
    icon: PieChart,
    allowedRoles: [ROLES.TREASURER],
  },
  {
    id: 'treasurer-audit',
    label: 'Audit & Payment History',
    path: '/treasurer/audit',
    icon: ShieldCheck,
    allowedRoles: [ROLES.TREASURER],
  },
  {
    id: 'treasurer-support',
    label: 'Help & Support Desk',
    path: '/treasurer/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.TREASURER],
    badge: 'Queries',
  },

  // ===========================================================================
  // 2. CLUB PRESIDENT / ORGANIZATION ADMIN NAVIGATION
  // Strictly scoped to user specification:
  // - Executive Hub (Live KPIs & Overview)
  // - Manage Club Profile (Branding, public site, socials)
  // - Publish Announcements (5 Active broadcasts, pin, member-only)
  // - Membership & Fees (3 Pending applications, set fees, approve members)
  // - Events & Fundraisers (Events management & ticketing)
  // ===========================================================================
  {
    id: 'president-dashboard',
    label: 'Executive Hub',
    path: '/president/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.PRESIDENT],
  },
  {
    id: 'president-profile',
    label: 'Club Profile',
    path: '/president/profile',
    icon: Building2,
    allowedRoles: [ROLES.PRESIDENT],
    badge: 'Branding',
  },
  {
    id: 'president-announcements',
    label: 'Announcements',
    path: '/president/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.PRESIDENT],
    badge: '5 Active',
  },
  {
    id: 'president-membership',
    label: 'Membership & Fees',
    path: '/president/membership',
    icon: Users,
    allowedRoles: [ROLES.PRESIDENT],
    badge: '3 Pending',
  },
  {
    id: 'president-events',
    label: 'Events & Fundraisers',
    path: '/president/events',
    icon: Calendar,
    allowedRoles: [ROLES.PRESIDENT],
  },
  {
    id: 'president-merchandise',
    label: 'Merchandise & Analytics',
    path: '/president/merchandise',
    icon: ShoppingBag,
    allowedRoles: [ROLES.PRESIDENT],
    badge: 'Store',
  },
  {
    id: 'president-support',
    label: 'Support & Club Queries',
    path: '/president/support',
    icon: HelpCircle,
    allowedRoles: [ROLES.PRESIDENT],
    badge: 'Queries',
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
  },
  {
    id: 'admin-clubs',
    label: 'Club Management',
    path: '/admin/clubs',
    icon: Building2,
    allowedRoles: [ROLES.ADMIN],
    badge: '12',
  },
  {
    id: 'admin-tickets',
    label: 'Ticket Support',
    path: '/admin/tickets',
    icon: Ticket,
    allowedRoles: [ROLES.ADMIN],
    badge: '4 Open',
  },
  {
    id: 'admin-elections',
    label: 'Annual Elections',
    path: '/admin/elections',
    icon: Vote,
    allowedRoles: [ROLES.ADMIN],
    badge: '3',
  },
  {
    id: 'admin-assistant',
    label: 'DB Query Assistant',
    path: '/admin/assistant',
    icon: Database,
    allowedRoles: [ROLES.ADMIN],
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

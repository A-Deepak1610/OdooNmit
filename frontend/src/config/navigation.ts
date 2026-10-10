import { NavigationItem } from '../types';
import { ROLES, UserRole } from './roles';
import {
  LayoutDashboard,
  Calendar,
  Compass,
  Megaphone,
  UserCheck,
  FileText,
  Ticket,
  ShoppingBag,
  CheckSquare,
  Receipt,
  Users,
  DollarSign,
  Vote,
  PieChart,
  Shield,
  Settings,
  History,
  TrendingUp,
  Award,
  Database,
  CalendarClock,
  Layers,
  Building2,
} from 'lucide-react';

/**
 * Role-specific navigation registry.
 * Defines all navigation sections and items per role matching CampusMitra's design system.
 */
export const navigationConfig: NavigationItem[] = [
  // ===========================================================================
  // STUDENT NAVIGATION
  // ===========================================================================
  {
    id: 'student-dashboard',
    label: 'Dashboard',
    path: '/student/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.STUDENT],
    group: 'MAIN',
  },
  {
    id: 'student-explore-events',
    label: 'Explore Events',
    path: '/student/events',
    icon: Compass,
    allowedRoles: [ROLES.STUDENT],
    group: 'CAMPUS ACTIVITIES',
  },
  {
    id: 'student-announcements',
    label: 'Announcements',
    path: '/student/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.STUDENT],
    group: 'CAMPUS ACTIVITIES',
  },
  {
    id: 'student-apply-membership',
    label: 'Apply for Membership',
    path: '/student/apply-membership',
    icon: UserCheck,
    allowedRoles: [ROLES.STUDENT],
    group: 'CLUB MEMBERSHIPS',
  },
  {
    id: 'student-my-applications',
    label: 'My Applications',
    path: '/student/applications',
    icon: FileText,
    allowedRoles: [ROLES.STUDENT],
    group: 'CLUB MEMBERSHIPS',
  },

  // ===========================================================================
  // MEMBER NAVIGATION
  // ===========================================================================
  {
    id: 'member-dashboard',
    label: 'Dashboard',
    path: '/member/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.MEMBER],
    group: 'MAIN',
  },
  {
    id: 'member-events',
    label: 'Events',
    path: '/member/events',
    icon: Calendar,
    allowedRoles: [ROLES.MEMBER],
    group: 'CLUB ACTIVITIES',
  },
  {
    id: 'member-announcements',
    label: 'Announcements',
    path: '/member/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.MEMBER],
    group: 'CLUB ACTIVITIES',
  },
  {
    id: 'member-membership',
    label: 'My Membership',
    path: '/member/membership',
    icon: UserCheck,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-tickets',
    label: 'My Tickets',
    path: '/member/tickets',
    icon: Ticket,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },
  {
    id: 'member-merchandise',
    label: 'Merchandise',
    path: '/member/merchandise',
    icon: ShoppingBag,
    allowedRoles: [ROLES.MEMBER],
    group: 'MEMBER HUB',
  },

  // ===========================================================================
  // VOLUNTEER NAVIGATION
  // ===========================================================================
  {
    id: 'volunteer-dashboard',
    label: 'Dashboard',
    path: '/volunteer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'MAIN',
  },
  {
    id: 'volunteer-tasks',
    label: 'My Tasks',
    path: '/volunteer/tasks',
    icon: CheckSquare,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-projects',
    label: 'Projects & Fundraisers',
    path: '/volunteer/projects',
    icon: Layers,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-events',
    label: 'Event Assignments',
    path: '/volunteer/events',
    icon: Calendar,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-expenses',
    label: 'Expense Claims',
    path: '/volunteer/expenses',
    icon: Receipt,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'VOLUNTEER OPERATIONS',
  },
  {
    id: 'volunteer-profile',
    label: 'Volunteer Profile',
    path: '/volunteer/profile',
    icon: UserCheck,
    allowedRoles: [ROLES.VOLUNTEER],
    group: 'ACCOUNT',
  },

  // ===========================================================================
  // EVENT ORGANIZER NAVIGATION
  // ===========================================================================
  {
    id: 'organizer-dashboard',
    label: 'Dashboard',
    path: '/organizer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'MAIN',
  },
  {
    id: 'organizer-events',
    label: 'My Events',
    path: '/organizer/events',
    icon: Calendar,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-attendees',
    label: 'Attendees',
    path: '/organizer/attendees',
    icon: Users,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },
  {
    id: 'organizer-tasks',
    label: 'Tasks',
    path: '/organizer/tasks',
    icon: CheckSquare,
    allowedRoles: [ROLES.EVENT_ORGANIZER],
    group: 'EVENT OPERATIONS',
  },

  // ===========================================================================
  // TREASURER NAVIGATION
  // ===========================================================================
  {
    id: 'treasurer-dashboard',
    label: 'Dashboard',
    path: '/treasurer/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.TREASURER],
    group: 'MAIN',
  },
  {
    id: 'treasurer-transactions',
    label: 'Transactions',
    path: '/treasurer/transactions',
    icon: DollarSign,
    allowedRoles: [ROLES.TREASURER],
    group: 'FINANCE & BUDGET',
  },
  {
    id: 'treasurer-reimbursements',
    label: 'Reimbursements',
    path: '/treasurer/reimbursements',
    icon: Receipt,
    allowedRoles: [ROLES.TREASURER],
    group: 'FINANCE & BUDGET',
  },
  {
    id: 'treasurer-reports',
    label: 'Reports',
    path: '/treasurer/reports',
    icon: PieChart,
    allowedRoles: [ROLES.TREASURER],
    group: 'FINANCE & BUDGET',
  },

  // ===========================================================================
  // PRESIDENT NAVIGATION
  // ===========================================================================
  {
    id: 'president-dashboard',
    label: 'Dashboard',
    path: '/president/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'MAIN',
  },
  {
    id: 'president-members',
    label: 'Members',
    path: '/president/members',
    icon: Users,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'CLUB GOVERNANCE',
  },
  {
    id: 'president-events',
    label: 'Events',
    path: '/president/events',
    icon: Calendar,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'CLUB GOVERNANCE',
  },
  {
    id: 'president-announcements',
    label: 'Announcements',
    path: '/president/announcements',
    icon: Megaphone,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'COMMUNICATIONS',
  },
  {
    id: 'president-elections',
    label: 'Elections',
    path: '/president/elections',
    icon: Vote,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'CLUB GOVERNANCE',
  },
  {
    id: 'president-finance',
    label: 'Finance Overview',
    path: '/president/finance',
    icon: DollarSign,
    allowedRoles: [ROLES.PRESIDENT],
    group: 'FINANCIAL OVERSIGHT',
  },

  // ===========================================================================
  // ADMIN NAVIGATION (matching attached UI reference!)
  // ===========================================================================
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [ROLES.ADMIN],
    group: 'MAIN',
  },
  {
    id: 'admin-clubs',
    label: 'Clubs',
    path: '/admin/clubs',
    icon: Building2,
    allowedRoles: [ROLES.ADMIN],
    group: 'CLUB MANAGEMENT',
  },
  {
    id: 'admin-my-events',
    label: 'My Events',
    path: '/admin/events',
    icon: Calendar,
    allowedRoles: [ROLES.ADMIN],
    group: 'EVENT MANAGEMENT',
  },
  {
    id: 'admin-incoming-events',
    label: 'Incoming Events',
    path: '/admin/incoming-events',
    icon: CalendarClock,
    allowedRoles: [ROLES.ADMIN],
    group: 'EVENT MANAGEMENT',
  },
  {
    id: 'admin-events-overview',
    label: 'Events Overview',
    path: '/admin/events-overview',
    icon: Layers,
    allowedRoles: [ROLES.ADMIN],
    group: 'EVENT MANAGEMENT',
  },
  {
    id: 'admin-event-analytics',
    label: 'Event Analytics',
    path: '/admin/event-analytics',
    icon: TrendingUp,
    allowedRoles: [ROLES.ADMIN],
    group: 'EVENT MANAGEMENT',
  },
  {
    id: 'admin-analytics',
    label: 'Analytics',
    path: '/admin/analytics',
    icon: PieChart,
    allowedRoles: [ROLES.ADMIN],
    group: 'INSTITUTIONAL DATA',
  },
  {
    id: 'admin-reports',
    label: 'Reports & Exports',
    path: '/admin/reports',
    icon: FileText,
    allowedRoles: [ROLES.ADMIN],
    group: 'INSTITUTIONAL DATA',
  },
  {
    id: 'admin-db-assistant',
    label: 'DB Assistant',
    path: '/admin/db-assistant',
    icon: Database,
    allowedRoles: [ROLES.ADMIN],
    group: 'INSTITUTIONAL DATA',
  },
  {
    id: 'admin-winners',
    label: 'Winners',
    path: '/admin/winners',
    icon: Award,
    allowedRoles: [ROLES.ADMIN],
    group: 'INSTITUTIONAL DATA',
  },
  {
    id: 'admin-users',
    label: 'Users',
    path: '/admin/users',
    icon: Users,
    allowedRoles: [ROLES.ADMIN],
    group: 'USER MANAGEMENT',
  },
  {
    id: 'admin-roles',
    label: 'Roles',
    path: '/admin/roles',
    icon: Shield,
    allowedRoles: [ROLES.ADMIN],
    group: 'USER MANAGEMENT',
  },
  {
    id: 'admin-settings',
    label: 'Organization Settings',
    path: '/admin/settings',
    icon: Settings,
    allowedRoles: [ROLES.ADMIN],
    group: 'USER MANAGEMENT',
  },
  {
    id: 'admin-audit-log',
    label: 'Audit Log',
    path: '/admin/audit-log',
    icon: History,
    allowedRoles: [ROLES.ADMIN],
    group: 'USER MANAGEMENT',
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

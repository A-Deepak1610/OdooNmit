import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { AdminDashboardPage } from '../pages/dashboards/AdminDashboardPage';
import { StudentModulePage } from '../pages/student/StudentModulePage';
import { RoleDashboardPage } from '../pages/dashboards/RoleDashboardPage';
import { EventsTicketingModule } from '../components/modules/events/EventsTicketingModule';
import { MembershipModule } from '../components/modules/memberships/MembershipModule';
import { MerchandiseTaskModule } from '../components/modules/merchandise/MerchandiseTaskModule';
import { AnnouncementBoardModule } from '../components/modules/announcements/AnnouncementBoardModule';
import { ElectionsVotingModule } from '../components/modules/elections/ElectionsVotingModule';
import {
  VolunteerDashboard,
  VolunteerTasks,
  VolunteerScanner,
  VolunteerEvents,
  VolunteerExpenses,
  VolunteerProfile,
} from '../features/volunteer';
import { useAuthStore } from '../stores/auth.store';
import { ROLES, getDefaultRole, ROLE_DEFAULT_PATHS } from '../config/roles';

import { LandingPage } from '../pages/LandingPage';
import { PresidentModulePage } from '../pages/president/PresidentModulePage';
import { PresidentEventsFundraisersPage } from '../pages/president/PresidentEventsFundraisersPage';
import { OrganizerEventsPage } from '../pages/organizer/OrganizerEventsPage';
import { TreasurerModulePage } from '../pages/treasurer/TreasurerModulePage';
import { EventsModulePage } from '../pages/events/EventsModulePage';
import { OrganizerSuitePage } from '../pages/organizer/OrganizerSuitePage';

/**
 * Root Landing Page:
 * Redirects authenticated users to their primary role workspace dashboard,
 * or unauthenticated users to /login.
 */
const RootRedirect: React.FC = () => {
  const { user, role, status } = useAuthStore();

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  const activeRole = role || getDefaultRole(user.roles || []);
  const targetPath = ROLE_DEFAULT_PATHS[activeRole] || '/student/dashboard';

  return <Navigate to={targetPath} replace />;
};

/**
 * Quick shortcut redirect for Landing Page links (events, memberships, finance, etc.)
 */
const ModuleRedirect: React.FC<{ subpath: string }> = ({ subpath }) => {
  const { user, role, status } = useAuthStore();
  if (status === 'unauthenticated' || !user) {
    return <Navigate to={`/login?redirect=/${subpath}`} replace />;
  }
  const activeRole = role || getDefaultRole(user.roles || []);

  if (subpath === 'elections' || subpath === 'voting') {
    if (activeRole === ROLES.ADMIN) {
      return <Navigate to="/admin/elections" replace />;
    }
    if (activeRole === ROLES.MEMBER) {
      return <Navigate to="/member/elections" replace />;
    }
    return <Navigate to="/student/elections" replace />;
  }

  const rolePrefix =
    activeRole === ROLES.ADMIN
      ? 'admin'
      : activeRole === ROLES.PRESIDENT
      ? 'president'
      : activeRole === ROLES.TREASURER
      ? 'treasurer'
      : activeRole === ROLES.EVENT_ORGANIZER
      ? 'organizer'
      : activeRole === ROLES.VOLUNTEER
      ? 'volunteer'
      : activeRole === ROLES.MEMBER
      ? 'member'
      : 'student';

  return <Navigate to={`/${rolePrefix}/${subpath}`} replace />;
};

export const router = createBrowserRouter([
  // ---------------------------------------------------------------------------
  // Public & Authentication Routes
  // ---------------------------------------------------------------------------
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <RootRedirect />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/access-denied',
    element: <AccessDeniedPage />,
  },

  // ---------------------------------------------------------------------------
  // Public-facing shortcuts from Landing Page
  // ---------------------------------------------------------------------------
  {
    path: '/events',
    element: <ModuleRedirect subpath="events" />,
  },
  {
    path: '/memberships',
    element: <ModuleRedirect subpath="apply-membership" />,
  },
  {
    path: '/tasks',
    element: <ModuleRedirect subpath="tasks" />,
  },
  {
    path: '/finance',
    element: <ModuleRedirect subpath="finance" />,
  },
  {
    path: '/merchandise',
    element: <ModuleRedirect subpath="merchandise" />,
  },
  {
    path: '/reimbursements',
    element: <ModuleRedirect subpath="reimbursements" />,
  },
  {
    path: '/fundraisers',
    element: <ModuleRedirect subpath="tasks" />,
  },
  {
    path: '/announcements',
    element: <ModuleRedirect subpath="announcements" />,
  },
  {
    path: '/elections',
    element: <ModuleRedirect subpath="elections" />,
  },
  {
    path: '/voting',
    element: <ModuleRedirect subpath="elections" />,
  },


  // ---------------------------------------------------------------------------
  // Authenticated Application Shell Routes (Pathless Layout Route)
  // ---------------------------------------------------------------------------
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [

      // -----------------------------------------------------------------------
      // STUDENT ROLE ROUTES (Strictly per user specification)
      // -----------------------------------------------------------------------
      {
        path: 'student',
        element: <ProtectedRoute allowedRoles={[ROLES.STUDENT]} />,
        children: [
          {
            path: 'dashboard',
            element: <StudentModulePage />,
          },
          {
            path: 'notifications',
            element: <StudentModulePage />,
          },
          {
            path: 'clubs',
            element: <StudentModulePage />,
          },
          {
            path: 'organizations',
            element: <StudentModulePage />,
          },
          {
            path: 'elections',
            element: <StudentModulePage />,
          },
          {
            path: 'voting',
            element: <StudentModulePage />,
          },
          {
            path: 'membership',
            element: <StudentModulePage />,
          },
          {
            path: 'apply-membership',
            element: <StudentModulePage />,
          },
          {
            path: 'events',
            element: <EventsTicketingModule />,
          },
          {
            path: 'tickets',
            element: <EventsTicketingModule />,
          },
          {
            path: 'merchandise',
            element: <MerchandiseTaskModule />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // MEMBER ROLE ROUTES
      // -----------------------------------------------------------------------
      {
        path: 'member',
        element: <ProtectedRoute allowedRoles={[ROLES.MEMBER]} />,
        children: [
          {
            path: 'dashboard',
            element: <RoleDashboardPage role={ROLES.MEMBER} />,
          },
          {
            path: 'events',
            element: <EventsTicketingModule />,
          },
          {
            path: 'announcements',
            element: <AnnouncementBoardModule />,
          },
          {
            path: 'membership',
            element: <MembershipModule />,
          },
          {
            path: 'tickets',
            element: <EventsTicketingModule />,
          },
          {
            path: 'merchandise',
            element: <MerchandiseTaskModule />,
          },
          {
            path: 'elections',
            element: <ElectionsVotingModule />,
          },
          {
            path: 'voting',
            element: <ElectionsVotingModule />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // VOLUNTEER ROLE ROUTES
      // -----------------------------------------------------------------------
      {
        path: 'volunteer',
        element: <ProtectedRoute allowedRoles={[ROLES.VOLUNTEER]} />,
        children: [
          {
            index: true,
            element: <Navigate to="/volunteer/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <VolunteerDashboard />,
          },
          {
            path: 'tasks',
            element: <VolunteerTasks />,
          },
          {
            path: 'scanner',
            element: <VolunteerScanner />,
          },
          {
            path: 'projects',
            element: <Navigate to="/volunteer/tasks" replace />,
          },
          {
            path: 'events',
            element: <VolunteerEvents />,
          },
          {
            path: 'expenses',
            element: <VolunteerExpenses />,
          },
          {
            path: 'announcements',
            element: <Navigate to="/volunteer/dashboard" replace />,
          },
          {
            path: 'submit-expense',
            element: <Navigate to="/volunteer/expenses" replace />,
          },
          {
            path: 'profile',
            element: <VolunteerProfile />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // EVENT ORGANIZER ROLE ROUTES
      // -----------------------------------------------------------------------
      {
        path: 'organizer',
        element: <ProtectedRoute allowedRoles={[ROLES.EVENT_ORGANIZER]} />,
        children: [
          {
            path: 'dashboard',
            element: <RoleDashboardPage role={ROLES.EVENT_ORGANIZER} />,
          },
          {
            path: 'events',
            element: <OrganizerSuitePage initialTab="events" />,
          },
          {
            path: 'analytics',
            element: <OrganizerSuitePage initialTab="analytics" />,
          },
          {
            path: 'revenue',
            element: <OrganizerSuitePage initialTab="revenue" />,
          },
          {
            path: 'volunteers',
            element: <OrganizerSuitePage initialTab="volunteers" />,
          },
          {
            path: 'checkin',
            element: <OrganizerSuitePage initialTab="checkin" />,
          },
          {
            path: 'attendees',
            element: <Navigate to="/organizer/checkin" replace />,
          },
          {
            path: 'scanner',
            element: <Navigate to="/organizer/checkin" replace />,
          },
          {
            path: 'tasks',
            element: <Navigate to="/organizer/volunteers" replace />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // TREASURER ROLE ROUTES
      // Responsible for club finances, records, and reimbursements:
      // - Track membership dues, ticket sales, merchandise income, and fundraiser income.
      // - Record and categorize expenses.
      // - Review reimbursement requests and attached receipts.
      // - Approve or reject reimbursements and record payouts.
      // - View income, expenses, and current balance.
      // - Generate semester financial reports.
      // - Review payment records and financial audit history.
      // -----------------------------------------------------------------------
      {
        path: 'treasurer',
        element: <ProtectedRoute allowedRoles={[ROLES.TREASURER]} />,
        children: [
          {
            index: true,
            element: <Navigate to="/treasurer/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <TreasurerModulePage />,
          },
          {
            path: 'dues',
            element: <TreasurerModulePage />,
          },
          {
            path: 'merchandise',
            element: <TreasurerModulePage />,
          },
          {
            path: 'finance',
            element: <TreasurerModulePage />,
          },
          {
            path: 'income',
            element: <TreasurerModulePage />,
          },
          {
            path: 'expenses',
            element: <TreasurerModulePage />,
          },
          {
            path: 'transactions',
            element: <TreasurerModulePage />,
          },
          {
            path: 'reimbursements',
            element: <TreasurerModulePage />,
          },
          {
            path: 'reports',
            element: <TreasurerModulePage />,
          },
          {
            path: 'audit',
            element: <TreasurerModulePage />,
          },
          {
            path: 'audit-history',
            element: <TreasurerModulePage />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // PRESIDENT ROLE ROUTES
      // -----------------------------------------------------------------------
      {
        path: 'president',
        element: <ProtectedRoute allowedRoles={[ROLES.PRESIDENT]} />,
        children: [
          {
            path: 'dashboard',
            element: <PresidentModulePage />,
          },
          {
            path: 'profile',
            element: <PresidentModulePage />,
          },
          {
            path: 'announcements',
            element: <PresidentModulePage />,
          },
          {
            path: 'membership',
            element: <PresidentModulePage />,
          },
          {
            path: 'members',
            element: <PresidentModulePage />,
          },
          {
            path: 'events',
            element: <EventsModulePage roleVariant="PRESIDENT" />,
          },
          {
            path: 'fundraisers',
            element: <EventsModulePage roleVariant="PRESIDENT" />,
          },
          {
            path: 'merchandise',
            element: <MerchandiseTaskModule />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // ADMIN ROLE ROUTES (System Administrator)
      // Manages the platform and access controls:
      // - Create, edit, deactivate organizations
      // - Assign club leadership and role permissions
      // - Manage accounts and access recovery
      // - View system-wide activity and audit history
      // - Configure platform-level settings
      // -----------------------------------------------------------------------
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboardPage />,
          },
          {
            path: 'clubs',
            element: <AdminDashboardPage />,
          },
          {
            path: 'tickets',
            element: <AdminDashboardPage />,
          },
          {
            path: 'elections',
            element: <AdminDashboardPage />,
          },
          {
            path: 'assistant',
            element: <AdminDashboardPage />,
          },
        ],
      },
    ],
  },

  // Fallback Wildcard
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

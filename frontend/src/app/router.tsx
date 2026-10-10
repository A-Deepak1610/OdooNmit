import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { AdminDashboardPage } from '../pages/dashboards/AdminDashboardPage';
import { RoleDashboardPage } from '../pages/dashboards/RoleDashboardPage';
import { EventsTicketingModule } from '../components/modules/events/EventsTicketingModule';
import { MembershipModule } from '../components/modules/memberships/MembershipModule';
import { MerchandiseTaskModule } from '../components/modules/merchandise/MerchandiseTaskModule';
import { FinanceLedgerModule } from '../components/modules/finance/FinanceLedgerModule';
import { AnnouncementBoardModule } from '../components/modules/announcements/AnnouncementBoardModule';
import { ElectionsVotingModule } from '../components/modules/elections/ElectionsVotingModule';
import {
  VolunteerDashboard,
  VolunteerTasks,
  VolunteerScanner,
  VolunteerProjects,
  VolunteerEvents,
  VolunteerExpenses,
  VolunteerAnnouncements,
  VolunteerProfile,
} from '../features/volunteer';
import { useAuthStore } from '../stores/auth.store';
import { ROLES, getDefaultRole, ROLE_DEFAULT_PATHS } from '../config/roles';

import { LandingPage } from '../pages/LandingPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDbAssistantPage } from '../pages/admin/AdminDbAssistantPage';
import { AdminWinnersPage } from '../pages/admin/AdminWinnersPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage';
import { AdminEventsOverviewPage } from '../pages/admin/AdminEventsOverviewPage';
import { AdminEventAnalyticsPage } from '../pages/admin/AdminEventAnalyticsPage';
import { AdminIncomingEventsPage } from '../pages/admin/AdminIncomingEventsPage';
import { AdminRolesPage } from '../pages/admin/AdminRolesPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminAuditLogPage } from '../pages/admin/AdminAuditLogPage';
import { AdminClubsPage } from '../pages/admin/AdminClubsPage';

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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <LoginPage />,
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
      // STUDENT ROLE ROUTES
      // -----------------------------------------------------------------------
      {
        path: 'student',
        element: <ProtectedRoute allowedRoles={[ROLES.STUDENT]} />,
        children: [
          {
            path: 'dashboard',
            element: <RoleDashboardPage role={ROLES.STUDENT} />,
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
            path: 'apply-membership',
            element: <MembershipModule />,
          },
          {
            path: 'applications',
            element: <MembershipModule />,
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
            element: <VolunteerProjects />,
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
            element: <VolunteerAnnouncements />,
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
            element: <EventsTicketingModule />,
          },
          {
            path: 'attendees',
            element: <EventsTicketingModule />,
          },
          {
            path: 'scanner',
            element: <VolunteerScanner />,
          },
          {
            path: 'tasks',
            element: <MerchandiseTaskModule />,
          },
        ],
      },

      // -----------------------------------------------------------------------
      // TREASURER ROLE ROUTES
      // -----------------------------------------------------------------------
      {
        path: 'treasurer',
        element: <ProtectedRoute allowedRoles={[ROLES.TREASURER]} />,
        children: [
          {
            path: 'dashboard',
            element: <RoleDashboardPage role={ROLES.TREASURER} />,
          },
          {
            path: 'transactions',
            element: <FinanceLedgerModule />,
          },
          {
            path: 'reimbursements',
            element: <FinanceLedgerModule />,
          },
          {
            path: 'reports',
            element: <FinanceLedgerModule />,
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
            element: <RoleDashboardPage role={ROLES.PRESIDENT} />,
          },
          {
            path: 'members',
            element: <MembershipModule />,
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
            path: 'finance',
            element: <FinanceLedgerModule />,
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
      // ADMIN ROLE ROUTES (Matches attached UI reference!)
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
            element: <AdminClubsPage />,
          },
          {
            path: 'events',
            element: <AdminEventsPage />,
          },
          {
            path: 'incoming-events',
            element: <AdminIncomingEventsPage />,
          },
          {
            path: 'events-overview',
            element: <AdminEventsOverviewPage />,
          },
          {
            path: 'event-analytics',
            element: <AdminEventAnalyticsPage />,
          },
          {
            path: 'analytics',
            element: <AdminAnalyticsPage />,
          },
          {
            path: 'reports',
            element: <AdminReportsPage />,
          },
          {
            path: 'db-assistant',
            element: <AdminDbAssistantPage />,
          },
          {
            path: 'winners',
            element: <AdminWinnersPage />,
          },
          {
            path: 'organizations',
            element: <AdminDashboardPage />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'roles',
            element: <AdminRolesPage />,
          },
          {
            path: 'audit-log',
            element: <AdminAuditLogPage />,
          },
          {
            path: 'settings',
            element: <AdminSettingsPage />,
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

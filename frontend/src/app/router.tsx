import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthCallbackPage } from '../pages/auth/AuthCallbackPage';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { AdminDashboardPage } from '../pages/dashboards/AdminDashboardPage';
import { RoleDashboardPage } from '../pages/dashboards/RoleDashboardPage';
import { PlaceholderPage } from '../components/shared/PlaceholderPage';
import { useAuthStore } from '../stores/auth.store';
import { ROLES, getDefaultRole, ROLE_DEFAULT_PATHS } from '../config/roles';

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

export const router = createBrowserRouter([
  // ---------------------------------------------------------------------------
  // Public & Authentication Routes
  // ---------------------------------------------------------------------------
  {
    path: '/login',
    element: <LoginPage />,
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
  // Authenticated Application Shell Routes
  // ---------------------------------------------------------------------------
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },

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
            element: (
              <PlaceholderPage
                title="Explore Campus Events"
                role={ROLES.STUDENT}
                group="CAMPUS ACTIVITIES"
              />
            ),
          },
          {
            path: 'announcements',
            element: (
              <PlaceholderPage
                title="Campus Announcements"
                role={ROLES.STUDENT}
                group="CAMPUS ACTIVITIES"
              />
            ),
          },
          {
            path: 'apply-membership',
            element: (
              <PlaceholderPage
                title="Apply for Club Membership"
                role={ROLES.STUDENT}
                group="CLUB MEMBERSHIPS"
              />
            ),
          },
          {
            path: 'applications',
            element: (
              <PlaceholderPage
                title="My Applications"
                role={ROLES.STUDENT}
                group="CLUB MEMBERSHIPS"
              />
            ),
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
            element: (
              <PlaceholderPage
                title="Club Events & Workshops"
                role={ROLES.MEMBER}
                group="CLUB ACTIVITIES"
              />
            ),
          },
          {
            path: 'announcements',
            element: (
              <PlaceholderPage
                title="Member Announcements"
                role={ROLES.MEMBER}
                group="CLUB ACTIVITIES"
              />
            ),
          },
          {
            path: 'membership',
            element: (
              <PlaceholderPage
                title="My Club Membership"
                role={ROLES.MEMBER}
                group="MEMBER HUB"
              />
            ),
          },
          {
            path: 'tickets',
            element: (
              <PlaceholderPage
                title="My Event Tickets"
                role={ROLES.MEMBER}
                group="MEMBER HUB"
              />
            ),
          },
          {
            path: 'merchandise',
            element: (
              <PlaceholderPage
                title="Club Merchandise"
                role={ROLES.MEMBER}
                group="MEMBER HUB"
              />
            ),
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
            path: 'dashboard',
            element: <RoleDashboardPage role={ROLES.VOLUNTEER} />,
          },
          {
            path: 'tasks',
            element: (
              <PlaceholderPage
                title="My Volunteer Tasks"
                role={ROLES.VOLUNTEER}
                group="VOLUNTEER OPERATIONS"
              />
            ),
          },
          {
            path: 'events',
            element: (
              <PlaceholderPage
                title="Volunteer Duty Events"
                role={ROLES.VOLUNTEER}
                group="VOLUNTEER OPERATIONS"
              />
            ),
          },
          {
            path: 'submit-expense',
            element: (
              <PlaceholderPage
                title="Submit Expense Claim"
                role={ROLES.VOLUNTEER}
                group="VOLUNTEER OPERATIONS"
              />
            ),
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
            element: (
              <PlaceholderPage
                title="My Managed Events"
                role={ROLES.EVENT_ORGANIZER}
                group="EVENT OPERATIONS"
              />
            ),
          },
          {
            path: 'attendees',
            element: (
              <PlaceholderPage
                title="Attendees & Check-in Desk"
                role={ROLES.EVENT_ORGANIZER}
                group="EVENT OPERATIONS"
              />
            ),
          },
          {
            path: 'tasks',
            element: (
              <PlaceholderPage
                title="Event Logistics & Tasks"
                role={ROLES.EVENT_ORGANIZER}
                group="EVENT OPERATIONS"
              />
            ),
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
            element: (
              <PlaceholderPage
                title="Financial Transactions"
                role={ROLES.TREASURER}
                group="FINANCE & BUDGET"
              />
            ),
          },
          {
            path: 'reimbursements',
            element: (
              <PlaceholderPage
                title="Reimbursements & Claims Review"
                role={ROLES.TREASURER}
                group="FINANCE & BUDGET"
              />
            ),
          },
          {
            path: 'reports',
            element: (
              <PlaceholderPage
                title="Audited Financial Reports"
                role={ROLES.TREASURER}
                group="FINANCE & BUDGET"
              />
            ),
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
            element: (
              <PlaceholderPage
                title="Club Membership Directory"
                role={ROLES.PRESIDENT}
                group="CLUB GOVERNANCE"
              />
            ),
          },
          {
            path: 'events',
            element: (
              <PlaceholderPage
                title="Executive Event Calendar"
                role={ROLES.PRESIDENT}
                group="CLUB GOVERNANCE"
              />
            ),
          },
          {
            path: 'announcements',
            element: (
              <PlaceholderPage
                title="Presidential Announcements"
                role={ROLES.PRESIDENT}
                group="COMMUNICATIONS"
              />
            ),
          },
          {
            path: 'elections',
            element: (
              <PlaceholderPage
                title="Club Elections & Balloting"
                role={ROLES.PRESIDENT}
                group="CLUB GOVERNANCE"
              />
            ),
          },
          {
            path: 'finance',
            element: (
              <PlaceholderPage
                title="Finance Overview"
                role={ROLES.PRESIDENT}
                group="FINANCIAL OVERSIGHT"
              />
            ),
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
            path: 'events',
            element: (
              <PlaceholderPage
                title="My Events"
                role={ROLES.ADMIN}
                group="EVENT MANAGEMENT"
              />
            ),
          },
          {
            path: 'incoming-events',
            element: (
              <PlaceholderPage
                title="Incoming Events"
                role={ROLES.ADMIN}
                group="EVENT MANAGEMENT"
              />
            ),
          },
          {
            path: 'events-overview',
            element: (
              <PlaceholderPage
                title="Events Overview"
                role={ROLES.ADMIN}
                group="EVENT MANAGEMENT"
              />
            ),
          },
          {
            path: 'event-analytics',
            element: (
              <PlaceholderPage
                title="Event Analytics"
                role={ROLES.ADMIN}
                group="EVENT MANAGEMENT"
              />
            ),
          },
          {
            path: 'analytics',
            element: (
              <PlaceholderPage
                title="Institutional Analytics"
                role={ROLES.ADMIN}
                group="INSTITUTIONAL DATA"
              />
            ),
          },
          {
            path: 'reports',
            element: (
              <PlaceholderPage
                title="Reports & Exports"
                role={ROLES.ADMIN}
                group="INSTITUTIONAL DATA"
              />
            ),
          },
          {
            path: 'db-assistant',
            element: (
              <PlaceholderPage
                title="DB Assistant"
                role={ROLES.ADMIN}
                group="INSTITUTIONAL DATA"
              />
            ),
          },
          {
            path: 'winners',
            element: (
              <PlaceholderPage
                title="Declared Winners"
                role={ROLES.ADMIN}
                group="INSTITUTIONAL DATA"
              />
            ),
          },
          {
            path: 'users',
            element: (
              <PlaceholderPage
                title="User Accounts & Directory"
                role={ROLES.ADMIN}
                group="USER MANAGEMENT"
              />
            ),
          },
          {
            path: 'roles',
            element: (
              <PlaceholderPage
                title="Role Assignment & Permissions"
                role={ROLES.ADMIN}
                group="USER MANAGEMENT"
              />
            ),
          },
          {
            path: 'settings',
            element: (
              <PlaceholderPage
                title="Organization Settings"
                role={ROLES.ADMIN}
                group="USER MANAGEMENT"
              />
            ),
          },
          {
            path: 'audit-log',
            element: (
              <PlaceholderPage
                title="Platform Audit Log"
                role={ROLES.ADMIN}
                group="USER MANAGEMENT"
              />
            ),
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Fallback / Catch-all
  // ---------------------------------------------------------------------------
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

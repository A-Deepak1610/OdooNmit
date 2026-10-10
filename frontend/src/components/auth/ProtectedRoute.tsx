import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '../../config/roles';
import { Loader2 } from 'lucide-react';
import { AccessDeniedPage } from '../../pages/AccessDeniedPage';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const location = useLocation();
  const { status, user, role, roles } = useAuthStore();

  // 1. Initializing / Session verification state
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Checking campus authorization...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state -> redirect to login
  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    // Check if user has active role matching allowedRoles
    const isActiveRoleAllowed = role && allowedRoles.includes(role);

    if (!isActiveRoleAllowed) {
      // Check if user owns at least one allowed role in their account
      const hasAnyAllowedRole = roles.some((r) => allowedRoles.includes(r));
      if (!hasAnyAllowedRole) {
        return <AccessDeniedPage />;
      }
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

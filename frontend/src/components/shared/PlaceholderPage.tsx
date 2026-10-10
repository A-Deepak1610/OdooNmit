import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { ROLE_DISPLAY_NAMES, UserRole } from '../../config/roles';
import { Layers, Sparkles, Building2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  role: UserRole;
  group?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This section has been scaffolded with role-based routing and permissions. Ready for business feature implementation.',
  role,
  group,
}) => {
  const { collegeName, user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default">
              {ROLE_DISPLAY_NAMES[role] || role} Workspace
            </Badge>
            {group && <span className="text-xs text-slate-400">/ {group}</span>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        {/* College & Status Pill */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs self-start md:self-auto">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="truncate max-w-[220px]">{collegeName}</span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            A++
          </span>
        </div>
      </div>

      {/* Main Scaffold Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center shadow-xs">
        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">{title} Module Scaffold</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          The authentication token, route guard, and role permissions for{' '}
          <strong>{ROLE_DISPLAY_NAMES[role] || role}</strong> are fully connected.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span>Active Authenticated User: {user?.name || user?.email || 'Student'}</span>
        </div>
      </div>
    </div>
  );
};

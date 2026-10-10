import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Calendar,
  Receipt,
  User,
  HeartHandshake,
  LogOut,
  X,
} from 'lucide-react';

interface VolunteerSidebarProps {
  onCloseMobile?: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Overview',
    path: '/volunteer/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'My Tasks',
    path: '/volunteer/tasks',
    icon: CheckSquare,
    badge: 'Core',
  },
  {
    label: 'Projects & Fundraisers',
    path: '/volunteer/projects',
    icon: Layers,
    badge: null,
  },
  {
    label: 'Event Assignments',
    path: '/volunteer/events',
    icon: Calendar,
    badge: null,
  },
  {
    label: 'Expense Claims',
    path: '/volunteer/expenses',
    icon: Receipt,
    badge: null,
  },
  {
    label: 'Volunteer Profile',
    path: '/volunteer/profile',
    icon: User,
    badge: null,
  },
];

export const VolunteerSidebar: React.FC<VolunteerSidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuthStore();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none shrink-0">
      {/* ── 1. PORTAL BRANDING HEADER ────────────────────────────── */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>CampusMitra</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Volunteer
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
              Skyline Association
            </div>
          </div>
        </div>

        {/* Mobile close drawer button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── 2. VOLUNTEER NAVIGATION LINKS ────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Volunteer Workspace
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* ── 3. USER PROFILE & LOGOUT FOOTER ──────────────────────── */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2 overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Volunteer'}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'V'}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'Volunteer User'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                Role: Active Volunteer
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

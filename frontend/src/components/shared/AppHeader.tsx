import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Building2,
  Search,
  Moon,
  Bell,
  Shield,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { ROLE_DEFAULT_PATHS, ROLE_DISPLAY_NAMES, UserRole } from '../../config/roles';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, toggleMobileSidebar } = useUiStore();
  const { user, role, roles, switchRole, collegeName } = useAuthStore();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetRole = e.target.value as UserRole;
    if (targetRole && roles.includes(targetRole)) {
      switchRole(targetRole);
      const defaultPath = ROLE_DEFAULT_PATHS[targetRole];
      if (defaultPath) {
        navigate(defaultPath);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6">
      {/* Left: Mobile menu toggle + College indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:inline-flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        {/* College Name Pill (Matches UI reference) */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-xs text-xs font-medium text-slate-700">
          <Building2 className="h-4 w-4 text-slate-500 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-[320px] md:max-w-none">
            {collegeName}
          </span>
        </div>
      </div>

      {/* Center / Right Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search input (Matches UI reference) */}
        <div className="relative hidden lg:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Find hackathons, mentors, or skills..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50/60 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Role Workspace Switcher (for multi-role users) */}
        {roles.length > 1 ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/60 px-2.5 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <select
              value={role || ''}
              onChange={handleRoleChange}
              className="bg-transparent text-xs font-semibold text-blue-800 focus:outline-none cursor-pointer pr-1"
              aria-label="Switch role workspace"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_DISPLAY_NAMES[r] || r} Workspace
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-medium">
            <Shield className="h-3.5 w-3.5 text-slate-500" />
            <span>{role ? (ROLE_DISPLAY_NAMES[role] || role) : 'Student'}</span>
          </div>
        )}

        {/* Dark Mode Icon Button (Matches UI reference) */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          <Moon className="h-4 w-4" />
        </button>

        {/* Notifications Icon Button with Dot (Matches UI reference) */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* User Avatar Thumbnail */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name || 'User'}
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CM'}
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { ROLE_DEFAULT_PATHS, UserRole } from '../../../config/roles';
import {
  Menu,
  Moon,
  Sun,
  Shield,
  Building2,
  HeartHandshake,
} from 'lucide-react';

interface VolunteerHeaderProps {
  onToggleMobileMenu: () => void;
}

export const VolunteerHeader: React.FC<VolunteerHeaderProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { role, roles, switchRole, collegeName } = useAuthStore();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('campus_theme', nextTheme);
    setIsDark(!isDark);
  };

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
    <header className="h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* ── Left Side: Mobile Menu + Campus Context ─────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Club tenant info */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">{collegeName || 'Dr.SNS Rajalakshmi College'} —</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Skyline Student Association
          </span>
        </div>

        {/* Role Workspace Switcher for multi-role users */}
        {roles.length > 1 && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-semibold">Active Role:</span>
            <select
              value={role || ''}
              onChange={handleRoleChange}
              className="bg-transparent border-none text-xs font-bold text-blue-900 dark:text-blue-200 focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right Side: Volunteer Badge & Theme Toggle ─────────── */}
      <div className="flex items-center gap-2.5">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Volunteer Portal</span>
        </span>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

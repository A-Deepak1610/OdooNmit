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
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* ── Left Side: Mobile Hamburger + Institution Context ───────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation drawer"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Institution Context Badge */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            padding: '6px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
        >
          <Building2 style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)' }} />
          <span>{collegeName || 'Dr.SNS Rajalakshmi College'} — Skyline Student Association</span>
        </div>

        {/* Multi-role Workspace Switcher */}
        {roles.length > 1 && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 10px',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#eff6ff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield style={{ width: '14px', height: '14px', color: '#2563eb' }} />
            <span style={{ fontWeight: 600 }}>Active Role:</span>
            <select
              value={role || ''}
              onChange={handleRoleChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1e3a8a',
                fontSize: '12px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right Side: Volunteer Desk Badge & Theme Toggle ────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '20px',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <HeartHandshake style={{ width: '15px', height: '15px' }} />
          <span>Volunteer Operations Desk</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          {isDark ? <Sun style={{ width: '18px', height: '18px' }} /> : <Moon style={{ width: '18px', height: '18px' }} />}
        </button>
      </div>
    </header>
  );
};

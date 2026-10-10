import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Moon,
  Sun,
  Bell,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { ROLE_DEFAULT_PATHS, ROLE_DISPLAY_NAMES, UserRole } from '../../config/roles';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { role, roles, switchRole, collegeName } = useAuthStore();
  const [isDark, setIsDark] = React.useState<boolean>(() => {
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
      {/* 1. Navbar Left — Institution Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            padding: '6px 10px',
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
          <span>{collegeName || 'Skyline Institute of Technology'}</span>
        </div>

        {/* Role Workspace Switcher (Multi-role accounts) */}
        {roles.length > 1 && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 8px',
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
            <select
              value={role || ''}
              onChange={handleRoleChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1e3a8a',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_DISPLAY_NAMES[r] || r} Workspace
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Navbar Center — Search Bar (320px width) */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: 'var(--muted-foreground)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search events, members, ledger..."
          style={{
            width: '100%',
            height: '36px',
            paddingLeft: '36px',
            paddingRight: '12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
            outline: 'none',
            fontFamily: 'var(--font-family-body)',
          }}
        />
      </div>

      {/* 3. Navbar Right — Actions (Theme toggle + Bell with red dot) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            transition: 'color 0.2s, background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Toggle Light/Dark Theme"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          {isDark ? (
            <Sun style={{ width: '20px', height: '20px' }} />
          ) : (
            <Moon style={{ width: '20px', height: '20px' }} />
          )}
        </button>

        {/* Notification Bell with red dot */}
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            padding: '6px',
            borderRadius: 'var(--radius-md)',
            transition: 'color 0.2s, background 0.2s',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Notifications"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          <Bell style={{ width: '20px', height: '20px' }} />
          {/* Red Notification Dot (8×8px absolute, border 2px var(--background)) */}
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: 'var(--destructive)',
              borderRadius: '50%',
              border: '2px solid var(--background)',
            }}
          />
        </button>
      </div>
    </header>
  );
};

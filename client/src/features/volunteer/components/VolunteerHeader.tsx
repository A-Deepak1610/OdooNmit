import React, { useState, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  HeartHandshake,
  Bell,
} from 'lucide-react';
import { NotificationDropdown } from '../../../components/shared/NotificationDropdown';
import { useNotificationStore } from '../../../stores/notification.store';

interface VolunteerHeaderProps {
  onToggleMobileMenu: () => void;
}

export const VolunteerHeader: React.FC<VolunteerHeaderProps> = ({ onToggleMobileMenu }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('campus_theme', nextTheme);
    setIsDark(!isDark);
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
      {/* ── Left Side: Mobile Hamburger Menu ───────── */}
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

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            style={{
              background: isNotificationsOpen ? 'var(--muted)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: isNotificationsOpen ? 'var(--foreground)' : 'var(--muted-foreground)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              transition: 'color 0.2s, background 0.2s',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Notifications"
            aria-label="View notifications"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              if (!isNotificationsOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--muted-foreground)';
              }
            }}
          >
            <Bell style={{ width: '20px', height: '20px' }} />
            {/* Dynamic Unread Badge Pill */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: '2px solid var(--background)',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>
      </div>
    </header>
  );
};

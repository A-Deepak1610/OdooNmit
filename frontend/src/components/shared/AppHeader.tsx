import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotificationStore } from '../../stores/notification.store';

export const AppHeader: React.FC = () => {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const { unreadCount, fetchNotifications } = useNotificationStore();

  React.useEffect(() => {
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
      {/* 1. Search Bar */}
      <div style={{ position: 'relative', width: '340px' }}>
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

      {/* 2. Navbar Right — Actions (Theme toggle + Bell with red dot) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

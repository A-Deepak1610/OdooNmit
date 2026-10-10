import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,

} from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';
import { useThemeStore } from '../../stores/theme.store';
import { useNotificationStore } from '../../stores/notification.store';
import { NotificationDropdown } from './NotificationDropdown';

export const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useUiStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const { unreadCount, fetchNotifications } = useNotificationStore();

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleHamburgerClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
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
        padding: '0 20px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* 1. Header Left: Hamburger Toggle + Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, marginRight: '16px' }}>
        <button
          type="button"
          onClick={handleHamburgerClick}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            color: 'var(--foreground)',
            padding: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, opacity 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>

        <div style={{ position: 'relative', maxWidth: '340px', width: '100%', minWidth: '140px' }}>
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
      </div>

      {/* 2. Navbar Right — Actions (Theme toggle + Bell with red dot) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            padding: '7px',
            borderRadius: 'var(--radius-md)',
            transition: 'color 0.2s, background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--secondary)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          {isDark ? (
            <Sun style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
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

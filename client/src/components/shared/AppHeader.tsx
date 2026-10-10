import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,

} from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';
import { useNotificationStore } from '../../stores/notification.store';
import { NotificationDropdown } from './NotificationDropdown';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { toggleSidebar, toggleMobileSidebar } = useUiStore();
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
        {/* Mobile-only hamburger toggle (Desktop toggle is inside the sidebar) */}
        <button
          type="button"
          onClick={handleHamburgerClick}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
          className="inline-flex lg:hidden items-center justify-center p-1.5 text-[var(--foreground)] hover:opacity-70 transition-opacity shrink-0 bg-transparent border-0 cursor-pointer"
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>

        {!isAdminRoute && (
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
              placeholder="Search..."
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
        )}
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

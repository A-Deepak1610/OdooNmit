import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
} from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';

export const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useUiStore();
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

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

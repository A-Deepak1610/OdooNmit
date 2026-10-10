import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '../components/shared/AppSidebar';
import { AppHeader } from '../components/shared/AppHeader';
import { useUiStore } from '../stores/ui.store';

/**
 * MainLayout shell component matching CampusMitra Master UI Architecture:
 * - Unified responsive layout for ALL roles (Student, Member, Volunteer, Organizer, Treasurer, President, Admin)
 * - Desktop: Sticky Collapsible Sidebar + Flex-1 Content Column
 * - Mobile: Sliding Drawer Sidebar with Backdrop Overlay + Hamburger Toggle in Header
 * - Background: var(--muted), Text: var(--foreground), Font: var(--font-family-body)
 */
export const AppLayout: React.FC = () => {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const location = useLocation();

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--muted)',
        fontFamily: 'var(--font-family-body)',
        color: 'var(--foreground)',
      }}
    >
      {/* 1. Desktop Sidebar (hidden on mobile/tablet < 1024px) */}
      <div className="hidden lg:flex flex-col h-full shrink-0">
        <AppSidebar />
      </div>

      {/* 2. Mobile Drawer Sidebar with Backdrop Overlay (< 1024px) */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-[var(--background)] shadow-2xl z-10">
            <AppSidebar
              isMobileDrawer
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Main Content Column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--muted)',
          minWidth: 0,
        }}
      >
        {/* Navbar (h: 60px, sticky top 0) */}
        <AppHeader />

        {/* Scrollable Viewport with 1400px centered max-width container */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              padding: '24px 32px',
              maxWidth: '1400px',
              margin: '0 auto',
              fontFamily: 'var(--font-family-body)',
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

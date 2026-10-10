import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/shared/AppSidebar';
import { AppHeader } from '../components/shared/AppHeader';

/**
 * MainLayout shell component matching CampusMitra Master UI Architecture:
 * - Flex row (Sidebar: 260px fixed + Content Column: flex 1)
 * - Content Column: Navbar (h: 60px) + <main> (flex 1, overflowY: auto)
 * - Background: var(--muted), Text: var(--foreground), Font: var(--font-family-body)
 */
export const AppLayout: React.FC = () => {
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
      {/* 260px Fixed Sidebar */}
      <AppSidebar />

      {/* Main Content Column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--muted)',
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

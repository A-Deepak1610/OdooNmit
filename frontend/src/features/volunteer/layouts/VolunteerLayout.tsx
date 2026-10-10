import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { VolunteerSidebar } from '../components/VolunteerSidebar';
import { VolunteerHeader } from '../components/VolunteerHeader';

/**
 * VolunteerLayout:
 * Follows CampusMitra Master UI Shell Architecture:
 * - Flex row: 260px Fixed Sidebar + Flex 1 Content Column
 * - Content Column: Navbar (h: 60px) + <main> (flex 1, overflowY: auto)
 * - Container: max-width 1400px, padding: 24px 32px
 * - Responsive mobile drawer with backdrop overlay
 */
export const VolunteerLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* ── 1. DESKTOP 260PX FIXED SIDEBAR ─────────────────────────── */}
      <div className="hidden md:flex flex-col h-full shrink-0">
        <VolunteerSidebar />
      </div>

      {/* ── 2. MOBILE DRAWER SIDEBAR WITH OVERLAY ─────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white dark:bg-slate-900 shadow-2xl z-10">
            <VolunteerSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT COLUMN ───────────────────────────────── */}
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
        {/* Sticky Header (h: 60px) */}
        <VolunteerHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable Viewport with spacious 1400px container */}
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

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { VolunteerSidebar } from '../components/VolunteerSidebar';
import { VolunteerHeader } from '../components/VolunteerHeader';

export const VolunteerLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* ── 1. DESKTOP FIXED SIDEBAR (Hidden on mobile) ───────────── */}
      <div className="hidden md:flex flex-col h-full shrink-0">
        <VolunteerSidebar />
      </div>

      {/* ── 2. MOBILE DRAWER SIDEBAR WITH OVERLAY ─────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl z-10">
            <VolunteerSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT COLUMN ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dedicated Volunteer Header */}
        <VolunteerHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

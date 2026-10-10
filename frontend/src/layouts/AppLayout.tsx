import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/shared/AppSidebar';
import { AppHeader } from '../components/shared/AppHeader';

/**
 * Shared AppLayout for authenticated/core application views.
 * Hosts the centralized AppSidebar, AppHeader, and responsive content container.
 */
export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-50">
      {/* Shared Responsive Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Shared Responsive Header */}
        <AppHeader />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

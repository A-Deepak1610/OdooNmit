import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layers } from 'lucide-react';

/**
 * Public/Auth layout used for unauthenticated or public entry pages.
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/25 mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-surface-900">
            Hackathon Starter
          </h2>
          <p className="text-xs text-surface-500 mt-1">
            Modular Monolith Architecture
          </p>
        </div>

        <div className="rounded-xl border border-surface-200/80 bg-white p-6 shadow-sm sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

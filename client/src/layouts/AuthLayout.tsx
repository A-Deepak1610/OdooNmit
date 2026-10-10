import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LandingPage } from '../modules/landing/pages/LandingPage';

/**
 * Public/Auth layout displaying the lightly blurred LandingPage in the background
 * behind the authentication modal dialog.
 */
export const AuthLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900/10 isolate">
      {/* Lightly blurred Landing Page in the background */}
      <div
        className="fixed inset-0 pointer-events-none select-none filter blur-[6px] scale-[1.02] opacity-85 overflow-hidden -z-10"
        aria-hidden="true"
      >
        <LandingPage />
      </div>

      {/* Subtle soft tint overlay for focus & contrast */}
      <div className="fixed inset-0 bg-slate-900/20 pointer-events-none -z-10" />

      {/* Modal Dialog Viewport */}
      <div
        onClick={handleBackdropClick}
        className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      >
        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;

import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Global application providers wrapper.
 * Validates session integrity with the backend on app boot.
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};

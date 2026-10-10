import React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Global application providers wrapper.
 * Can be extended with React Query, ThemeProvider, ToastProvider, etc.
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center text-surface-500 space-y-3 min-h-[200px]',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-brand-600', iconSizes[size])} />
      {message && <p className="text-sm font-medium">{message}</p>}
      <span className="sr-only">Loading content</span>
    </div>
  );
};

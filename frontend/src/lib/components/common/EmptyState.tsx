import React from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-space-lg sm:p-space-xl text-center bg-surface-container-low/40 rounded-xl border border-dashed border-outline-variant my-4',
        className,
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-sm">
          {icon}
        </div>
      )}
      <h4 className="font-headline-sm text-headline-sm uppercase text-on-surface m-0">
        {title}
      </h4>
      {description && (
        <p className="font-body-sm text-body-sm text-secondary max-w-sm mt-1 mb-space-md">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};


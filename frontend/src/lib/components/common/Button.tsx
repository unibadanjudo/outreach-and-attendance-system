import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-label-lg rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary:
        'bg-primary text-on-primary hover:bg-primary-container shadow-sm focus:ring-primary',
      secondary:
        'bg-surface-container-high text-on-surface hover:bg-surface-container-highest focus:ring-secondary',
      outline:
        'border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container focus:ring-primary',
      ghost:
        'bg-transparent text-secondary hover:text-on-surface hover:bg-surface-container focus:ring-secondary',
      danger:
        'bg-error text-on-error hover:bg-red-700 shadow-sm focus:ring-error',
      inverse:
        'bg-inverse-surface text-inverse-on-surface hover:bg-on-surface shadow-sm focus:ring-inverse-surface',
    };

    const sizes = {
      sm: 'px-2.5 py-1 text-body-sm gap-1.5',
      md: 'px-3.5 py-2 text-label-md gap-2',
      lg: 'px-5 py-2.5 text-label-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

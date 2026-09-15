import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="font-label-caps uppercase text-secondary font-bold text-[11px]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-secondary pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-surface-container-low text-on-surface placeholder:text-secondary rounded-lg font-body-md text-body-md py-2.5 outline-none transition-all border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary',
              leftIcon ? 'pl-10' : 'px-3.5',
              rightIcon ? 'pr-10' : 'px-3.5',
              error && 'border-error focus:border-error focus:ring-error',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-secondary flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="font-body-sm text-error mt-0.5">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';

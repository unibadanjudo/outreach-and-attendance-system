import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = React.useCallback(() => {
    setIsAnimating(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let animFrame: number;

    if (isOpen) {
      setShouldRender(true);
      animFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shouldRender, isOpen, handleClose]);

  if (!shouldRender) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-500 ease-out',
        isAnimating
          ? 'bg-black/50 backdrop-blur-xs'
          : 'bg-black/0 backdrop-blur-none pointer-events-none',
      )}
    >
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative px-3 py-5 w-full bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[85vh]',
          'transition-all duration-500 ease-out transform-gpu',
          isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-full opacity-0 sm:translate-y-0 sm:scale-95',
          maxWidths[maxWidth],
        )}
      >
        {/* Mobile Pull / Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-surface-container-high rounded-full mx-auto mt-1 mb-2 shrink-0" />

        <div className="flex items-start justify-between p-space-md sm:p-space-lg border-b border-surface-container-low">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface leading-snug">
                {title}
              </h3>
            )}
            {description && (
              <p className="font-body-sm text-body-sm text-secondary m-0">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors ml-2 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-space-md sm:p-space-lg overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

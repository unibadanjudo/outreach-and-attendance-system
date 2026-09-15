import React from 'react';
import { cn } from '../../utils/cn';
import { getBeltInfo } from '../../utils/belt';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'urgent';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-container-high text-on-surface',
    success: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    error: 'bg-error-container text-on-error-container border border-[#FECACA]',
    info: 'bg-tertiary-fixed text-on-tertiary-fixed',
    urgent: 'bg-primary text-on-primary font-bold shadow-xs',
  };

  const sizes = {
    sm: 'px-1.5 py-0.2 text-[10px]',
    md: 'px-2 py-0.5 font-label-caps',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded font-label-caps tracking-wider uppercase leading-tight font-semibold',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const ActivityStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'RECENTLY_INACTIVE':
      return <Badge variant="warning">Recently Inactive</Badge>;
    case 'INACTIVE':
      return <Badge variant="error">Inactive</Badge>;
    case 'LONG_TERM_INACTIVE':
      return <Badge variant="error">Long-Term Inactive</Badge>;
    case 'NEVER_ATTENDED':
      return <Badge variant="default">Never Attended</Badge>;
    default:
      return <Badge variant="default">{status || 'Unknown'}</Badge>;
  }
};

export const BeltBadge: React.FC<{ belt?: string; showKyu?: boolean }> = ({
  belt,
  showKyu = false,
}) => {
  const info = getBeltInfo(belt);
  const isUnranked = info.name === 'Unranked';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-caps font-bold text-[10px] border shadow-xs transition-colors',
        info.bgClass,
        info.textClass,
        info.borderClass,
      )}
    >
      <span
        className={cn('w-2 h-2 rounded-full border border-black/20 shrink-0', info.colorClass)}
      />
      <span>{isUnranked ? 'Unranked' : `${info.name} Belt`}</span>
      {showKyu && !isUnranked && <span className="opacity-85 font-medium">({info.kyu})</span>}
    </span>
  );
};

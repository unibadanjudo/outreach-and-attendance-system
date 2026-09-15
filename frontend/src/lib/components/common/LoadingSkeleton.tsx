import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'line';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'line',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-low rounded-xl p-5 h-32 flex flex-col justify-between border border-surface-container"
          >
            <div className="h-4 bg-surface-container-high rounded w-1/3" />
            <div className="h-8 bg-surface-container-high rounded w-1/2 my-2" />
            <div className="h-3 bg-surface-container-high rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container-low p-4 animate-pulse">
        <div className="h-10 bg-surface-container-low rounded mb-3" />
        <div className="flex flex-col gap-2.5">
          {items.map((_, i) => (
            <div
              key={i}
              className="h-12 bg-surface-container-low/60 rounded flex items-center px-4 gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-container-high" />
              <div className="h-4 bg-surface-container-high rounded flex-1" />
              <div className="h-4 bg-surface-container-high rounded w-24" />
              <div className="h-4 bg-surface-container-high rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-surface-container-high rounded w-full" />
      ))}
    </div>
  );
};

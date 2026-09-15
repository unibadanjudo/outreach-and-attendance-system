import React from 'react';
import type { OutreachQueueSummary } from '../../types';

interface OutreachFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  summary?: OutreachQueueSummary;
}

export const OutreachFilterTabs: React.FC<OutreachFilterTabsProps> = ({
  activeTab,
  onTabChange,
  summary,
}) => {
  const tabs: Array<{ id: string; label: string; count?: number; urgent?: boolean }> = [
    { id: 'ALL', label: 'Needs Attention', count: summary?.totalInQueue ?? 0 },
    {
      id: 'FOLLOW_UP_DUE',
      label: 'Follow-up Due',
      count: summary?.followUpDueCount ?? 0,
      urgent: (summary?.followUpDueCount ?? 0) > 0,
    },
    { id: 'CONTACTED', label: 'Recently Contacted' },
    { id: 'NO_RESPONSE', label: 'No Response' },
    { id: 'WILL_RETURN', label: 'Will Return / Returning' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === tab.id
              ? 'bg-primary text-on-primary font-bold shadow-xs'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`px-2 py-0.2 rounded-full font-bold text-xs ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-primary'
                  : tab.urgent
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-secondary'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

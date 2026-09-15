import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOutreachQueue } from '../../lib/hooks/useOutreach';
import { OutreachFilterTabs } from '../../lib/components/outreach/OutreachFilterTabs';
import { OutreachQueueDeck } from '../../lib/components/outreach/OutreachQueueDeck';
import { OutreachActionConsole } from '../../lib/components/outreach/OutreachActionConsole';
import { LoadingSkeleton } from '../../lib/components/common/LoadingSkeleton';
import { EmptyState } from '../../lib/components/common/EmptyState';
import { Button } from '../../lib/components/common/Button';
import type { OutreachQueueItem } from '../../lib/types';

export const OutreachPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlMemberId = searchParams.get('memberId');

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<OutreachQueueItem | null>(null);

  const { data, isLoading, isError, refetch } = useOutreachQueue({
    isFollowUpDue: activeTab === 'FOLLOW_UP_DUE' ? true : undefined,
    status:
      activeTab !== 'ALL' && activeTab !== 'FOLLOW_UP_DUE'
        ? (activeTab as any)
        : undefined,
    limit: 50,
  });

  const queueItems = data?.items || [];

  useEffect(() => {
    if (urlMemberId && queueItems.length > 0) {
      const found = queueItems.find((i) => i.member.id === urlMemberId);
      if (found) setSelectedItem(found);
    } else if (!selectedItem && queueItems.length > 0) {
      setSelectedItem(queueItems[0]);
    }
  }, [urlMemberId, queueItems, selectedItem]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton variant="card" count={1} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <LoadingSkeleton variant="card" count={4} />
          </div>
          <div className="lg:col-span-5">
            <LoadingSkeleton variant="card" count={1} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-caps bg-primary text-on-primary px-2.5 py-0.5 rounded font-bold">
              RETENTION RADAR
            </span>
            <span className="font-body-sm text-secondary">
              Inactive Judoka Re-engagement Pipeline
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight m-0">
            Outreach Management Console
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="font-metric-lg text-primary leading-none">
              {data?.summary?.totalInQueue ?? queueItems.length}
            </span>
            <span className="font-label-caps text-secondary text-[10px]">
              IN QUEUE
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <OutreachFilterTabs
        activeTab={activeTab}
        onTabChange={(t) => {
          setActiveTab(t);
          setSelectedItem(null);
        }}
        summary={data?.summary}
      />

      {/* 2-Column Split Workspace */}
      {isError ? (
        <EmptyState
          title="Unable to Load Outreach Queue"
          description="Failed to fetch pending member follow-ups from the server."
          action={
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : queueItems.length === 0 ? (
        <EmptyState
          title="Outreach Deck Cleared!"
          description="All inactive judokas in this category have been contacted or follow-ups are up to date."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Deck (7 Cols) */}
          <div className="lg:col-span-7">
            <OutreachQueueDeck
              items={queueItems}
              selectedMemberId={selectedItem?.member.id}
              onSelect={(item) => setSelectedItem(item)}
            />
          </div>

          {/* Right Console (5 Cols) */}
          <div className="lg:col-span-5">
            <OutreachActionConsole
              item={selectedItem}
              onSuccess={() => {
                refetch();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../lib/hooks/useDashboard';
import { SummaryCards } from '../../lib/components/dashboard/SummaryCards';
import { AttendanceChart } from '../../lib/components/dashboard/AttendanceChart';
import { RetentionHealthCard } from '../../lib/components/dashboard/RetentionHealthCard';
import { TriageTable } from '../../lib/components/dashboard/TriageTable';
import { LoadingSkeleton } from '../../lib/components/common/LoadingSkeleton';
import { EmptyState } from '../../lib/components/common/EmptyState';
import { Button } from '../../lib/components/common/Button';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading, isError, refetch } = useDashboard({ limit: 15 });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton variant="card" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <LoadingSkeleton variant="table" count={5} />
          </div>
          <div className="lg:col-span-4">
            <LoadingSkeleton variant="card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Dojo Metrics Unavailable"
        description="Could not connect to the Dojo API server. Please check your backend connection."
        action={
          <Button variant="primary" onClick={() => refetch()}>
            Retry Connection
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container-low shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-caps bg-primary text-on-primary px-2.5 py-0.5 rounded font-bold">
              DOJO COMMAND
            </span>
            <span className="font-body-sm text-secondary">
              Sub-Dean Sports Pavilion • University of Ibadan
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight m-0">
            Judoka Operational Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">event_available</span>
            <span>Record Mats</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/outreach')}
            className="flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">ring_volume</span>
            <span>Launch Outreach</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <SummaryCards summary={dashboard?.summary} />

      {/* 2-Column Split: Attendance Trend + Retention Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <AttendanceChart data={dashboard?.attendance} />
        </div>
        <div className="lg:col-span-4">
          <RetentionHealthCard
            outreach={dashboard?.outreach}
            summary={dashboard?.summary}
          />
        </div>
      </div>

      {/* Triage Priority Queue */}
      <TriageTable
        items={dashboard?.inactiveMembers || []}
        onContact={() => navigate('/outreach')}
      />
    </div>
  );
};


import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useMemberSummary,
  useMemberAttendance,
  useMemberOutreach,
} from '../../lib/hooks/useMembers';
import { MemberProfileHeader } from '../../lib/components/members/MemberProfileHeader';
import { MemberStatsMatrix } from '../../lib/components/members/MemberStatsMatrix';
import { MemberBioCard } from '../../lib/components/members/MemberBioCard';
import { MemberHistoryTabs } from '../../lib/components/members/MemberHistoryTabs';
import { LoadingSkeleton } from '../../lib/components/common/LoadingSkeleton';
import { EmptyState } from '../../lib/components/common/EmptyState';
import { Button } from '../../lib/components/common/Button';
import { ErrorBoundary } from '../../lib/components/common/ErrorBoundary';

export const MemberDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const summaryQuery = useMemberSummary(id || '');
  const attendanceQuery = useMemberAttendance(id || '');
  const outreachQuery = useMemberOutreach(id || '');

  if (summaryQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton variant="card" count={1} />
        <LoadingSkeleton variant="card" count={4} />
        <LoadingSkeleton variant="table" count={5} />
      </div>
    );
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <EmptyState
        title="Judoka Record Not Found"
        description="Unable to locate this member profile or load summary metrics from the server."
        action={
          <Button variant="primary" onClick={() => navigate('/members')}>
            Return to Roster
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* 360 Profile Header */}
      <MemberProfileHeader
        summary={summaryQuery.data}
        onContactClick={() => navigate(`/outreach?memberId=${id}`)}
      />

      {/* KPI Stats Matrix */}
      <MemberStatsMatrix summary={summaryQuery.data} />

      {/* Academic & Background Info */}
      <MemberBioCard member={summaryQuery.data.member} />

      {/* Full Attendance & Outreach Log Tabs */}
      <ErrorBoundary name="MemberHistoryTabs">
        <MemberHistoryTabs
          attendanceRecords={attendanceQuery.data}
          outreachRecords={outreachQuery.data}
        />
      </ErrorBoundary>
    </div>
  );
};

import React from 'react';
import { Calendar, Clock, TrendingUp, Compass } from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { MemberSummaryResponse } from '../../types';

interface MemberStatsMatrixProps {
  summary: MemberSummaryResponse;
}

export const MemberStatsMatrix: React.FC<MemberStatsMatrixProps> = ({ summary }) => {
  const { attendanceStats, lastAttendance, attendanceTrend, recommendedAction } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Attendance */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-low shadow-xs">
        <div className="flex items-center justify-between text-secondary">
          <span className="font-label-caps font-semibold">Total Mat Sessions</span>
          <Calendar className="w-4 h-4" />
        </div>
        <div className="my-2">
          <span className="font-metric-lg text-on-surface">
            {attendanceStats?.totalAttendance ?? summary.attendanceCount ?? 0}
          </span>
          <span className="font-body-sm text-secondary ml-1.5">Sessions</span>
        </div>
        <div className="font-body-sm text-secondary text-xs">
          Last 30 days: {attendanceStats?.attendanceLast30Days ?? 0}
        </div>
      </div>

      {/* Days Since Last Mat */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-low shadow-xs">
        <div className="flex items-center justify-between text-secondary">
          <span className="font-label-caps font-semibold">Last Attended</span>
          <Clock className="w-4 h-4" />
        </div>
        <div className="my-2">
          <span className="font-headline-lg text-primary font-bold">
            {attendanceStats?.daysSinceLastAttendance !== null &&
            attendanceStats?.daysSinceLastAttendance !== undefined
              ? `${attendanceStats.daysSinceLastAttendance}d ago`
              : 'Never'}
          </span>
        </div>
        <div className="font-body-sm text-secondary text-xs">
          {formatDate(lastAttendance || summary.lastAttendedDate || null)}
        </div>
      </div>

      {/* Trajectory */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-low shadow-xs">
        <div className="flex items-center justify-between text-secondary">
          <span className="font-label-caps font-semibold">Activity Trend</span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="my-2">
          <span className="font-headline-lg uppercase text-on-surface font-bold">
            {attendanceTrend || 'Stable'}
          </span>
        </div>
        <div className="font-body-sm text-secondary text-xs">
          Frequency: {attendanceStats?.attendanceFrequency ?? '0'} / wk
        </div>
      </div>

      {/* Recommended Action */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-low shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-secondary">
          <span className="font-label-caps font-semibold">Coach Action Plan</span>
          <Compass className="w-4 h-4 text-tertiary" />
        </div>
        <div className="my-1.5">
          <span className="font-label-lg text-tertiary font-bold line-clamp-1">
            {recommendedAction || 'Monitor regular training'}
          </span>
        </div>
        <div className="font-body-sm text-secondary text-xs">
          Next follow-up: {formatDate(summary.nextFollowUp || null)}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { DashboardAttendance } from '../../types';

interface AttendanceChartProps {
  data?: DashboardAttendance;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const timeline = data?.dailyAttendanceLast14Days || [];
  const avg = data?.averageAttendancePerSession ?? 0;
  const recent30 = data?.attendanceLast30Days ?? 0;

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container-low flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container-low">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
              Session Attendance Flow
            </span>
            <span className="font-label-caps bg-surface-container-high text-on-surface px-1.5 py-0.5 rounded">
              Monday - Saturday Dojo
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary m-0">
            Average <strong className="text-on-surface">{avg} judokas / session</strong> •{' '}
            {recent30} individual mat entries recorded this cycle
          </p>
        </div>

        {/* Period Toggle Tabs */}
        <div className="inline-flex bg-surface-container-low p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setPeriod('7d')}
            className={`font-label-md text-label-md px-3 py-1 rounded transition-colors cursor-pointer ${
              period === '7d'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`font-label-md text-label-md px-3 py-1 rounded transition-colors cursor-pointer ${
              period === '30d'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`font-label-md text-label-md px-3 py-1 rounded transition-colors cursor-pointer ${
              period === '90d'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Semester
          </button>
        </div>
      </div>

      {/* Recharts Area Flow */}
      <div className="py-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c62828" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#c62828" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5b5e67' }} />
            <YAxis tick={{ fontSize: 11, fill: '#5b5e67' }} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #dfe2ec',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val} Judokas`, 'Turnout']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#a20513"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#attendanceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Session Breakdown Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-surface-container-low">
        {Object.entries(data?.sessionBreakdown || {})
          .filter(([sess]) => sess !== 'NO_TRAINING')
          .slice(0, 3)
          .map(([sess, count], idx) => (
            <div
              key={sess}
              className={`p-2.5 rounded-lg flex flex-col ${
                idx === 2 ? 'bg-surface-container-high' : 'bg-surface-container-low'
              }`}
            >
              <span
                className={`font-label-caps ${
                  idx === 2 ? 'text-primary font-bold' : 'text-secondary'
                }`}
              >
                {sess} Mats
              </span>
              <span
                className={`font-headline-sm ${
                  idx === 2 ? 'text-primary' : 'text-on-surface'
                }`}
              >
                {count} Judokas
              </span>
              <span
                className={`font-body-sm ${
                  idx === 2 ? 'text-primary font-medium' : 'text-secondary'
                }`}
              >
                Logged mat entries
              </span>
            </div>
          ))}
        {(!data?.sessionBreakdown ||
          Object.keys(data.sessionBreakdown).filter((k) => k !== 'NO_TRAINING').length === 0) && (
          <div className="sm:col-span-3 text-center py-2 text-secondary font-body-sm">
            No session entries logged yet for this cycle.
          </div>
        )}
      </div>
    </div>
  );
};

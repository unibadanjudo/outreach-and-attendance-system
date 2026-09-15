import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

import { formatDate } from '../../utils/formatters';

interface AttendanceTalliesProps {
  present: number;
  absent: number;
  excused: number;
  total: number;
  date?: string;
  onSave?: () => void;
  isSaving?: boolean;
}

export const AttendanceTallies: React.FC<AttendanceTalliesProps> = ({
  present,
  absent,
  excused,
  total,
  date,
  onSave,
  isSaving = false,
}) => {
  const turnoutRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Present */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border-l-4 border-l-[#16A34A] border-y border-r border-surface-container-low flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label-caps uppercase text-secondary">
            Present on Mat
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-metric-xl text-[#16A34A] leading-none">
              {present}
            </span>
            <span className="font-label-md text-secondary">/ {total} Judokas</span>
          </div>
          <span className="font-body-sm text-secondary mt-0.5">
            {turnoutRate}% active turnout rate
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Absent */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border-l-4 border-l-primary border-y border-r border-surface-container-low flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label-caps uppercase text-secondary">
            Unexcused Absent
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-metric-xl text-primary leading-none">
              {absent}
            </span>
            <span className="font-label-caps uppercase bg-error-container text-on-error-container px-1.5 py-0.2 rounded font-bold">
              Risk
            </span>
          </div>
          <span className="font-body-sm text-secondary mt-0.5">
            Tagged for outreach triage
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-error-container text-primary flex items-center justify-center">
          <XCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Excused */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border-l-4 border-l-[#D97706] border-y border-r border-surface-container-low flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-label-caps uppercase text-secondary">
            Excused Absences
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-metric-xl text-[#D97706] leading-none">
              {excused}
            </span>
            <span className="font-label-md text-secondary">Verified</span>
          </div>
          <span className="font-body-sm text-secondary mt-0.5">
            Exams, illness &amp; injury
          </span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Save CTA */}
      <div className="bg-primary-container p-4 rounded-xl shadow-sm border border-primary text-on-primary flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-label-caps uppercase text-on-primary-container tracking-wider font-bold">
            Sync &amp; Commit
          </span>
          <span className="font-label-caps text-on-primary-container">
            LIVE SHEETS API
          </span>
        </div>
        <div className="my-1.5">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-surface-container-lowest text-primary hover:bg-surface-container py-2 px-3 rounded-lg font-headline-sm uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>
              Save {date ? formatDate(date) : 'Session'} ({present} Present)
            </span>
          </button>
        </div>
        <span className="font-label-caps text-[10px] text-on-primary-container text-center">
          {date ? `Logging for ${date} directly to Google Sheet` : 'Appends directly to official UI Judo Google Sheet'}
        </span>
      </div>
    </section>
  );
};

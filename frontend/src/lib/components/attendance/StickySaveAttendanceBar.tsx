import React from 'react';
import { Save, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface StickySaveAttendanceBarProps {
  isVisible: boolean;
  date: string;
  session: string;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  totalCount: number;
  onSave: () => void;
  isSaving: boolean;
}

export const StickySaveAttendanceBar: React.FC<StickySaveAttendanceBarProps> = ({
  isVisible,
  date,
  session,
  presentCount,
  absentCount,
  excusedCount,
  totalCount,
  onSave,
  isSaving,
}) => {
  const isNoTraining = session === 'NO_TRAINING';

  return (
    <aside
      aria-label="Sticky attendance save bar"
      aria-hidden={!isVisible}
      className={`fixed top-16 left-0 right-0 lg:left-72 z-30 bg-surface-container-lowest/95 backdrop-blur-md border-b border-surface-container-high shadow-md transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Left Info: Session Context & Realtime Rollcall Breakdown */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base sm:text-lg">🥋</span>
            <div className="flex flex-col">
              <span className="font-label-lg font-bold text-on-surface text-xs sm:text-sm leading-tight truncate">
                {date ? formatDate(date) : 'Today'}
              </span>
              <span className="font-label-caps text-[10px] text-secondary tracking-wider">
                {session}
              </span>
            </div>
          </div>

          {!isNoTraining ? (
            <div className="hidden xs:flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label-md font-bold bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{presentCount}</span>
                <span className="hidden sm:inline">Present</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label-md font-bold bg-error-container text-primary border border-primary/20">
                <XCircle className="w-3 h-3" />
                <span>{absentCount}</span>
                <span className="hidden sm:inline">Absent</span>
              </span>
              {excusedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-label-md font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20">
                  <Clock className="w-3 h-3" />
                  <span>{excusedCount}</span>
                  <span className="hidden sm:inline">Excused</span>
                </span>
              )}
            </div>
          ) : (
            <span className="hidden sm:inline-flex text-xs font-label-caps bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold">
              Session Excused (No Training)
            </span>
          )}
        </div>

        {/* Right CTA: Save Attendance Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-container text-on-primary py-2 px-3.5 sm:px-5 rounded-lg font-headline-sm text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isNoTraining
                ? 'Save No-Training Log'
                : `Save Attendance (${presentCount} Present)`}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

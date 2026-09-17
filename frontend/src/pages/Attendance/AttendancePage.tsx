import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { canMarkAttendance } from '../../lib/types/auth.types';
import { useMembersList } from '../../lib/hooks/useMembers';
import { useAttendanceList, useBatchRecordAttendance } from '../../lib/hooks/useAttendance';
import { SessionControls } from '../../lib/components/attendance/SessionControls';
import { AttendanceTallies } from '../../lib/components/attendance/AttendanceTallies';
import { RosterRecorder } from '../../lib/components/attendance/RosterRecorder';
import { AttendanceHistoryTable } from '../../lib/components/attendance/AttendanceHistoryTable';
import { LoadingSkeleton } from '../../lib/components/common/LoadingSkeleton';
import type { AttendanceStatus, CreateAttendanceDto } from '../../lib/types';

function getDefaultSessionForDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  switch (day) {
    case 1: return 'MONDAY';
    case 2: return 'TUESDAY';
    case 3: return 'WEDNESDAY';
    case 4: return 'THURSDAY';
    case 5: return 'FRIDAY';
    case 6: return 'SATURDAY';
    default: return 'SATURDAY';
  }
}

export const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const canMark = canMarkAttendance(user?.role);
  const [activeView, setActiveView] = useState<'RECORDER' | 'HISTORY'>(() => (canMark ? 'RECORDER' : 'HISTORY'));
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [session, setSession] = useState(() => getDefaultSessionForDate(today));
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (!canMark && activeView === 'RECORDER') {
      setActiveView('HISTORY');
    }
  }, [canMark, activeView]);

  const { data: membersData, isLoading: isLoadingMembers } = useMembersList({ limit: 500 });
  const { data: attendanceData, isLoading: isLoadingAttendance } = useAttendanceList({
    date,
    session,
    limit: 500,
  });

  const batchMutation = useBatchRecordAttendance();

  // Sync statuses whenever members or existing attendance for the selected (date, session) changes
  useEffect(() => {
    if (!membersData?.items) return;
    const existingMap = new Map<string, AttendanceStatus>();
    if (attendanceData?.items) {
      attendanceData.items.forEach((att) => {
        const id = att.memberId.toLowerCase();
        existingMap.set(id, att.status);
        const digits = id.replace(/[^0-9]/g, '');
        if (digits) {
          existingMap.set(digits, att.status);
          existingMap.set(`mem_${digits}`, att.status);
          if (digits.startsWith('0')) {
            existingMap.set(`mem_${digits.substring(1)}`, att.status);
            existingMap.set(digits.substring(1), att.status);
          } else {
            existingMap.set(`mem_0${digits}`, att.status);
            existingMap.set(`0${digits}`, att.status);
          }
        }
      });
    }

    const nextStatuses: Record<string, AttendanceStatus> = {};
    membersData.items.forEach((m) => {
      const mDigits = (m.phoneNumber || m.id).replace(/[^0-9]/g, '');
      const existingStatus =
        existingMap.get(m.id.toLowerCase()) ||
        (mDigits ? existingMap.get(mDigits) : undefined) ||
        (mDigits ? existingMap.get(`mem_${mDigits}`) : undefined) ||
        (mDigits && mDigits.startsWith('0') ? existingMap.get(`mem_${mDigits.substring(1)}`) : undefined) ||
        (mDigits && !mDigits.startsWith('0') ? existingMap.get(`mem_0${mDigits}`) : undefined);

      if (existingStatus) {
        nextStatuses[m.id] = existingStatus;
      } else if (session === 'NO_TRAINING') {
        nextStatuses[m.id] = 'EXCUSED';
      } else {
        nextStatuses[m.id] = 'ABSENT';
      }
    });
    setStatuses(nextStatuses);
  }, [membersData, attendanceData, session]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    // Suggest day-of-week session unless user has chosen NO_TRAINING or SPECIAL
    if (session !== 'NO_TRAINING' && session !== 'SPECIAL') {
      setSession(getDefaultSessionForDate(newDate));
    }
  };

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [memberId]: status }));
  };

  const handleMarkAllPresent = () => {
    if (!membersData?.items) return;
    const updated: Record<string, AttendanceStatus> = {};
    membersData.items.forEach((m) => {
      updated[m.id] = 'PRESENT';
    });
    setStatuses(updated);
    toast.info('All judokas set to PRESENT');
  };

  const handleMarkAllExcused = () => {
    if (!membersData?.items) return;
    const updated: Record<string, AttendanceStatus> = {};
    membersData.items.forEach((m) => {
      updated[m.id] = 'EXCUSED';
    });
    setStatuses(updated);
    toast.info('All judokas set to EXCUSED');
  };

  const rosterItems = (membersData?.items || []).map((m) => ({
    member: m,
    status: statuses[m.id] || (session === 'NO_TRAINING' ? 'EXCUSED' : 'ABSENT'),
  }));

  const presentCount = rosterItems.filter((i) => i.status === 'PRESENT').length;
  const absentCount = rosterItems.filter((i) => i.status === 'ABSENT').length;
  const excusedCount = rosterItems.filter((i) => i.status === 'EXCUSED').length;

  const handleSaveSession = async () => {
    if (!rosterItems.length) return;
    const records: CreateAttendanceDto[] = rosterItems.map((item) => ({
      memberId: item.member.id,
      attendanceDate: date,
      trainingSession: session,
      status: item.status,
      isCorrection: true,
      notes: session === 'NO_TRAINING'
        ? 'Training session did not hold today'
        : 'Recorded via Dojo Command mat console',
    }));

    try {
      await batchMutation.mutateAsync(records);
      if (session === 'NO_TRAINING') {
        toast.success(`Logged "${date}" as No Training Session Held.`);
      } else {
        toast.success(
          `Session saved! ${presentCount} present judokas logged to Google Sheet.`
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync attendance batch');
    }
  };

  if (isLoadingMembers) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton variant="card" count={1} />
        <LoadingSkeleton variant="card" count={4} />
        <LoadingSkeleton variant="table" count={8} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high pb-2">
        <div className="flex items-center gap-2">
          {canMark && (
            <button
              onClick={() => setActiveView('RECORDER')}
              className={`font-label-lg px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                activeView === 'RECORDER'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              🥋 Take Mat Attendance
            </button>
          )}
          <button
            onClick={() => setActiveView('HISTORY')}
            className={`font-label-lg px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
              activeView === 'HISTORY'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-lowest text-secondary hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            📅 Attendance Records &amp; Logs (All Dates)
          </button>
        </div>

        {!canMark && (
          <span className="font-label-caps text-xs text-secondary bg-surface-container px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
            <span className="material-symbols-outlined text-sm">lock</span>
            Read-only Attendance (Coach/Captain required to mark)
          </span>
        )}
      </div>

      {activeView === 'HISTORY' || !canMark ? (
        <AttendanceHistoryTable />
      ) : (
        <>
          {/* Session Header & Block Picker */}
          <SessionControls
            date={date}
            onDateChange={handleDateChange}
            session={session}
            onSessionChange={setSession}
          />

          {/* No Training Alert Banner */}
          {session === 'NO_TRAINING' && (
            <div className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-[#D97706] shrink-0" />
                <div>
                  <p className="font-headline-sm text-sm font-bold m-0 text-[#92400E]">
                    Training Session Did Not Hold Today ({date})
                  </p>
                  <p className="font-body-sm text-xs m-0 text-[#B45309]">
                    Judokas will be recorded as Excused so this session is not counted as unexcused absence in inactivity calculations.
                  </p>
                </div>
              </div>
              <button
                onClick={handleMarkAllExcused}
                className="self-start sm:self-auto bg-[#D97706] hover:bg-[#B45309] text-white font-label-md font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Mark All Excused
              </button>
            </div>
          )}

          {/* Real-time Turnout Tallies & Commit CTA */}
          <AttendanceTallies
            present={presentCount}
            absent={absentCount}
            excused={excusedCount}
            total={rosterItems.length}
            date={date}
            onSave={handleSaveSession}
            isSaving={batchMutation.isPending || isLoadingAttendance}
          />

          {/* Mat Roster Interactive Recorder */}
          <RosterRecorder
            roster={rosterItems}
            date={date}
            onStatusChange={handleStatusChange}
            onMarkAllPresent={handleMarkAllPresent}
          />
        </>
      )}
    </div>
  );
};

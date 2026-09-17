import React, { useState } from 'react';
import { Calendar, Search, RefreshCw } from 'lucide-react';
import { useAttendanceList } from '../../hooks/useAttendance';
import { useMembersList } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { Pagination } from '../common/Pagination';
import type { AttendanceStatus } from '../../types';

export const AttendanceHistoryTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSession, setFilterSession] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const { data: membersData } = useMembersList({ limit: 500 });
  const { data: attendanceData, isLoading, refetch, isFetching } = useAttendanceList({
    date: filterDate || undefined,
    session: filterSession !== 'ALL' ? filterSession : undefined,
    status: filterStatus !== 'ALL' ? (filterStatus as AttendanceStatus) : undefined,
    limit: 500,
  });

  const memberMap = new Map<string, { name: string; faculty: string; matric: string }>();
  if (membersData?.items) {
    membersData.items.forEach((m) => {
      const info = {
        name: `${m.firstName} ${m.lastName}`.trim(),
        faculty: m.facultyDepartment || 'General',
        matric: m.matricNumber || m.phoneNumber || '',
      };
      memberMap.set(m.id.toLowerCase(), info);
      const digits = (m.phoneNumber || m.id).replace(/[^0-9]/g, '');
      if (digits) {
        memberMap.set(digits, info);
        memberMap.set(`mem_${digits}`, info);
        if (digits.startsWith('0')) {
          memberMap.set(`mem_${digits.substring(1)}`, info);
          memberMap.set(digits.substring(1), info);
        } else {
          memberMap.set(`mem_0${digits}`, info);
          memberMap.set(`0${digits}`, info);
        }
      }
    });
  }

  const getMemberInfo = (memberId: string) => {
    const cleanId = memberId.toLowerCase();
    const digits = cleanId.replace(/[^0-9]/g, '');
    return (
      memberMap.get(cleanId) ||
      (digits ? memberMap.get(digits) : undefined) ||
      (digits ? memberMap.get(`mem_${digits}`) : undefined) ||
      (digits && digits.startsWith('0') ? memberMap.get(`mem_${digits.substring(1)}`) : undefined) ||
      (digits && !digits.startsWith('0') ? memberMap.get(`mem_0${digits}`) : undefined)
    );
  };

  const items = attendanceData?.items || [];
  const filteredItems = items.filter((att) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const info = getMemberInfo(att.memberId);
    const memberName = info ? info.name.toLowerCase() : '';
    const memberMatric = info ? info.matric.toLowerCase() : '';
    const memberId = att.memberId.toLowerCase();
    return memberName.includes(q) || memberMatric.includes(q) || memberId.includes(q);
  });

  const total = filteredItems.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedItems = filteredItems.slice((page - 1) * limit, page * limit);

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-low overflow-hidden flex flex-col">
      {/* Filter Controls Toolbar */}
      <div className="p-4 bg-surface-container-low flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-surface-container-high">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Member Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-secondary absolute left-3 top-3 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by judoka name, matric, or ID..."
              className="w-full bg-surface-container-lowest pl-9 pr-4 py-2 rounded-xl text-on-surface placeholder:text-secondary font-body-md text-body-md outline-none border border-transparent focus:border-primary shadow-xs"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container-high shadow-xs">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-label-caps text-secondary text-xs">Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-label-md text-on-surface font-semibold outline-none cursor-pointer text-xs"
            />
            {filterDate && (
              <button
                onClick={() => {
                  setFilterDate('');
                  setPage(1);
                }}
                className="text-secondary hover:text-primary font-bold text-xs ml-1 cursor-pointer"
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          {/* Session Filter */}
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container-high shadow-xs">
            <span className="font-label-caps text-secondary text-xs">Session:</span>
            <select
              value={filterSession}
              onChange={(e) => {
                setFilterSession(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-label-md text-on-surface font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Sessions</option>
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="NO_TRAINING">No Training Held</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-surface-container-high shadow-xs">
            <span className="font-label-caps text-secondary text-xs">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-label-md text-on-surface font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="EXCUSED">Excused</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end xl:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-secondary hover:text-on-surface border border-surface-container-high transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 font-label-md text-xs font-semibold"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="p-4">
          <LoadingSkeleton variant="table" count={6} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
          <Calendar className="w-10 h-10 text-secondary/50" />
          <p className="font-headline-sm text-on-surface m-0">No Attendance Records Found</p>
          <p className="font-body-sm text-secondary m-0">
            {filterDate || filterSession !== 'ALL' || filterStatus !== 'ALL' || search
              ? 'Try changing or clearing your filters to see more results.'
              : 'Take attendance using the Mat Session Check-in console to log records.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse font-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-secondary font-label-caps uppercase text-xs border-b border-surface-container-high">
                  <th className="py-3 px-4">Attendance Date</th>
                <th className="py-3 px-4">Judoka Member</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {paginatedItems.map((att) => {
                const memberInfo = getMemberInfo(att.memberId);
                return (
                  <tr key={att.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Date Column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg font-bold text-on-surface">
                            {formatDate(att.attendanceDate)}
                          </span>
                          <span className="font-mono text-[11px] text-secondary">
                            {att.attendanceDate}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Member Column */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-label-md font-bold text-on-surface">
                          {memberInfo ? memberInfo.name : att.memberId}
                        </span>
                        <span className="font-body-sm text-secondary text-xs">
                          {memberInfo ? `${memberInfo.faculty} • ${memberInfo.matric}` : att.memberId}
                        </span>
                      </div>
                    </td>

                    {/* Session */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-label-caps px-2 py-0.5 rounded bg-surface-container text-on-surface font-semibold text-[11px]">
                        {att.trainingSession}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-label-caps px-2.5 py-1 rounded-full font-bold text-xs ${
                          att.status === 'PRESENT'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : att.status === 'EXCUSED'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>

                    {/* Recorded By */}
                    <td className="py-3 px-4 whitespace-nowrap text-secondary text-xs">
                      {att.recordedBy}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-secondary text-xs max-w-xs truncate italic">
                      {att.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length > 0 && (
          <div className="p-3 border-t border-surface-container-high bg-surface-container-low/20">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              itemsPerPageOptions={[10, 25, 50, 100]}
              itemLabel="Attendance Logs"
            />
          </div>
        )}
      </>
    )}
    </section>
  );
};

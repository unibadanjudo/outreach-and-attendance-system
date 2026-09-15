import React, { useState } from 'react';
import { formatDate } from '../../utils/date';
import type { Attendance, Outreach } from '../../types';

interface MemberHistoryTabsProps {
  attendanceRecords?: Attendance[];
  outreachRecords?: Outreach[];
}

export const MemberHistoryTabs: React.FC<MemberHistoryTabsProps> = ({
  attendanceRecords = [],
  outreachRecords = [],
}) => {
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'OUTREACH'>('ATTENDANCE');

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-low shadow-xs overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-surface-container-low bg-surface-container-low/40">
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-5 py-3.5 font-label-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'ATTENDANCE'
              ? 'border-primary text-primary font-bold bg-surface-container-lowest'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Attendance Record Log ({attendanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('OUTREACH')}
          className={`px-5 py-3.5 font-label-lg transition-colors cursor-pointer border-b-2 ${
            activeTab === 'OUTREACH'
              ? 'border-primary text-primary font-bold bg-surface-container-lowest'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          Outreach Communications ({outreachRecords.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5">
        {activeTab === 'ATTENDANCE' ? (
          attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-secondary font-body-sm">
              No training sessions recorded for this judoka yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-secondary font-label-caps uppercase">
                    <th className="py-2.5 px-3 rounded-l">Date</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                    <th className="py-2.5 px-3 rounded-r">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {attendanceRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-surface-container-low/50">
                      <td className="py-3 px-3 font-medium text-on-surface">
                        {formatDate(att.attendanceDate)}
                      </td>
                      <td className="py-3 px-3 text-secondary">{att.trainingSession}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-label-caps px-2 py-0.5 rounded font-bold ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-secondary text-xs">{att.recordedBy}</td>
                      <td className="py-3 px-3 text-secondary text-xs italic">
                        {att.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : outreachRecords.length === 0 ? (
          <div className="text-center py-8 text-secondary font-body-sm">
            No outreach or follow-up communications on record.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {outreachRecords.map((out) => (
              <div
                key={out.id}
                className="bg-surface-container-low/50 p-4 rounded-xl border border-surface-container flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-caps bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-semibold">
                    {out.contactMethod} • {out.status}
                  </span>
                  <span className="font-body-sm text-secondary text-xs">
                    {formatDate(out.contactedAt)} by {out.contactedBy}
                  </span>
                </div>
                {out.message && (
                  <p className="font-body-sm text-on-surface m-0 bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-low">
                    {out.message}
                  </p>
                )}
                {out.response && (
                  <p className="font-body-sm text-secondary text-xs m-0">
                    <strong className="text-on-surface">Judoka reply:</strong> {out.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

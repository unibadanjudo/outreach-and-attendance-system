import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import { ActivityStatusBadge, BeltBadge } from '../common/Badge';
import { UpdateBeltRankModal } from '../members/UpdateBeltRankModal';
import { formatDate } from '../../utils/date';
import type { InactiveMemberItem, Member } from '../../types';

interface TriageTableProps {
  items: InactiveMemberItem[];
  onContact?: (member: InactiveMemberItem) => void;
}

export const TriageTable: React.FC<TriageTableProps> = ({ items, onContact }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'NO_CONTACT'>('ALL');
  const [rankingMember, setRankingMember] = useState<Member | null>(null);

  const filtered = items.filter((item) => {
    if (filter === 'HIGH') return item.priorityScore >= 8000;
    if (filter === 'NO_CONTACT') return item.attendanceCount === 0 || !item.lastAttendance;
    return true;
  });

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-low p-5 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase m-0">
              Members Who Need Immediate Attention
            </h2>
          </div>
          <span className="font-body-sm text-body-sm text-secondary">
            Prioritized triage deck based on absence duration and attendance history
          </span>
        </div>

        {/* Triage Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`font-label-caps px-3 py-1.5 rounded transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            ALL INACTIVE ({items.length})
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`font-label-caps px-3 py-1.5 rounded transition-colors cursor-pointer ${
              filter === 'HIGH'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            HIGH PRIORITY
          </button>
          <button
            onClick={() => setFilter('NO_CONTACT')}
            className={`font-label-caps px-3 py-1.5 rounded transition-colors cursor-pointer ${
              filter === 'NO_CONTACT'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            NO ATTENDANCE
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-secondary font-label-caps tracking-wider uppercase">
              <th className="py-2.5 px-3.5 rounded-l-lg">Judoka &amp; Faculty</th>
              <th className="py-2.5 px-3.5">Belt Rank</th>
              <th className="py-2.5 px-3.5">Last Attended</th>
              <th className="py-2.5 px-3.5">Days Inactive</th>
              <th className="py-2.5 px-3.5">Status</th>
              <th className="py-2.5 px-3.5 rounded-r-lg text-right">Immediate Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm">
            {filtered.slice(0, 10).map((item) => (
              <tr
                key={item.member.id}
                className="hover:bg-surface-container-low/60 transition-colors"
              >
                <td className="py-3 px-3.5">
                  <div className="flex flex-col">
                    <button
                      onClick={() => navigate(`/members/${item.member.id}`)}
                      className="font-label-lg text-on-surface hover:text-primary text-left cursor-pointer transition-colors"
                    >
                      {item.member.firstName} {item.member.lastName}
                    </button>
                    <span className="font-body-sm text-secondary text-xs">
                      {item.member.facultyDepartment} • {item.member.phoneNumber}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <BeltBadge belt={item.member.beltRank} showKyu />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRankingMember(item.member);
                      }}
                      className="p-1 rounded text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                      title="Update Judo belt rank"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="text-on-surface font-medium">
                    {formatDate(item.lastAttendance)}
                  </span>
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="font-headline-sm text-primary font-bold">
                    {item.daysInactive !== null ? `${item.daysInactive} Days` : 'Never'}
                  </span>
                </td>
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <ActivityStatusBadge status={item.activityStatus} />
                </td>
                <td className="py-3 px-3.5 text-right whitespace-nowrap">
                  <button
                    onClick={() =>
                      onContact ? onContact(item) : navigate('/outreach')
                    }
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-3 py-1.5 rounded font-label-md font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Contact Member</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Belt Rank Modal */}
      <UpdateBeltRankModal
        isOpen={Boolean(rankingMember)}
        onClose={() => setRankingMember(null)}
        member={rankingMember}
      />
    </section>
  );
};

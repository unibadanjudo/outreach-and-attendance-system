import React, { useState } from 'react';
import { Search, Check, X, Clock, Calendar } from 'lucide-react';
import { BeltBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import type { AttendanceStatus, Member } from '../../types';

const isValidNickname = (nickname?: string | null): nickname is string => {
  if (!nickname) return false;
  const clean = nickname.trim().toLowerCase();
  return clean !== '' && clean !== 'nil' && clean !== 'none' && clean !== 'n/a' && clean !== '-';
};

interface RosterItem {
  member: Member;
  status: AttendanceStatus;
}

interface RosterRecorderProps {
  roster: RosterItem[];
  date?: string;
  onStatusChange: (memberId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
}

export const RosterRecorder: React.FC<RosterRecorderProps> = ({
  roster,
  date,
  onStatusChange,
  onMarkAllPresent,
}) => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'EXCUSED'>('ALL');

  const filtered = roster.filter((item) => {
    if (tab !== 'ALL' && item.status !== tab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = `${item.member.firstName} ${item.member.lastName}`.toLowerCase();
      const phone = (item.member.phoneNumber || '').toLowerCase();
      const matric = (item.member.matricNumber || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || matric.includes(q);
    }
    return true;
  });

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container-low overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-surface-container-high">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-3 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, matric, or phone..."
            className="w-full bg-surface-container-lowest pl-9 pr-4 py-2 rounded-xl text-on-surface placeholder:text-secondary font-body-md text-body-md outline-none border border-transparent focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {date && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest rounded-lg border border-surface-container-high text-xs font-label-md text-on-surface shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold">{formatDate(date)}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high">
            {(['ALL', 'PRESENT', 'ABSENT', 'EXCUSED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-label-caps px-3 py-1 rounded transition-colors cursor-pointer ${tab === t
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-secondary hover:text-on-surface'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={onMarkAllPresent}
            className="bg-inverse-surface text-inverse-on-surface hover:bg-on-surface px-3.5 py-1.5 rounded-lg font-label-md font-bold transition-all shadow-xs cursor-pointer"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {/* Roster List */}
      <div className="divide-y divide-surface-container-low max-h-[600px] overflow-y-auto">
        {filtered.map(({ member, status }) => (
          <div
            key={member.id}
            className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-on-surface leading-tight">
                  {member.firstName} {member.lastName}
                </span>
                {isValidNickname(member.nickname) && (
                  <span className="font-body-sm text-secondary text-xs italic">
                    "{member.nickname.trim()}"
                  </span>
                )}
                <span className="font-body-sm text-secondary text-xs">
                  {member.facultyDepartment} • {member.matricNumber || member.phoneNumber}
                </span>



                {date && (
                  <span className="font-label-caps text-[10px] text-primary/80 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> Session Date: {date}
                  </span>
                )}
              </div>
              <BeltBadge belt={member.beltRank} showKyu />
            </div>

            {/* Status Button Toggles */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => onStatusChange(member.id, 'PRESENT')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-label-md font-bold transition-all cursor-pointer ${status === 'PRESENT'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
                  }`}
              >
                <Check className="w-4 h-4" />
                <span>Present</span>
              </button>
              <button
                onClick={() => onStatusChange(member.id, 'ABSENT')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-label-md font-bold transition-all cursor-pointer ${status === 'ABSENT'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
                  }`}
              >
                <X className="w-4 h-4" />
                <span>Absent</span>
              </button>
              <button
                onClick={() => onStatusChange(member.id, 'EXCUSED')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-label-md font-bold transition-all cursor-pointer ${status === 'EXCUSED'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface'
                  }`}
              >
                <Clock className="w-4 h-4" />
                <span>Excused</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

import React from 'react';
import { PhoneCall, Calendar, AlertCircle } from 'lucide-react';
import { BeltBadge } from '../common/Badge';
import { formatDate } from '../../utils/date';
import type { OutreachQueueItem } from '../../types';

interface OutreachQueueDeckProps {
  items: OutreachQueueItem[];
  selectedMemberId?: string;
  onSelect: (item: OutreachQueueItem) => void;
}

export const OutreachQueueDeck: React.FC<OutreachQueueDeckProps> = ({
  items,
  selectedMemberId,
  onSelect,
}) => {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-headline-sm text-headline-sm uppercase text-on-surface">
            Critical Triage Deck
          </span>
          <span className="font-label-caps bg-surface-container-highest text-secondary px-2 py-0.5 rounded">
            Sorted by Risk Index
          </span>
        </div>
        <span className="font-body-sm text-secondary">
          Displaying {items.length} judokas needing intervention
        </span>
      </div>

      {items.map((item) => {
        const isSelected = selectedMemberId === item.member.id;
        const isHigh = item.priority === 'HIGH' || item.isFollowUpDue;

        return (
          <div
            key={item.member.id}
            onClick={() => onSelect(item)}
            className={`bg-surface-container-lowest rounded-xl p-4 shadow-xs border relative overflow-hidden transition-all cursor-pointer hover:shadow-md ${
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                : 'border-surface-container-low'
            }`}
          >
            {/* Left Priority Strip */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                isHigh ? 'bg-primary' : 'bg-amber-500'
              }`}
            />

            <div className="flex flex-col gap-3 pl-1.5">
              {/* Top Row: Identity & Priority Pill */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {item.member.firstName[0]}
                    {item.member.lastName[0]}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-headline-sm text-headline-sm uppercase text-on-surface leading-none m-0">
                        {item.member.firstName} {item.member.lastName}
                      </h4>
                      <BeltBadge belt={item.member.beltRank} showKyu />
                    </div>
                    <span className="font-body-sm text-secondary text-xs mt-0.5">
                      {item.member.facultyDepartment} • {item.member.phoneNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {item.isFollowUpDue && (
                    <span className="bg-error-container text-on-error-container font-label-caps px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                      Follow-up Due Today
                    </span>
                  )}
                  <span
                    className={`font-label-caps px-2 py-0.5 rounded font-bold uppercase ${
                      isHigh
                        ? 'bg-primary text-on-primary'
                        : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}
                  >
                    Priority: {item.priority}
                  </span>
                </div>
              </div>

              {/* Attendance & Absence Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-lg text-body-sm font-body-sm">
                <div>
                  <span className="text-secondary">Days Inactive: </span>
                  <strong className="text-primary font-headline-sm text-base">
                    {item.daysInactive !== null ? `${item.daysInactive} Days` : 'Never attended'}
                  </strong>
                  <div className="text-secondary text-xs mt-0.5">
                    Last session: {formatDate(item.lastAttendanceDate)}
                  </div>
                </div>

                <div className="pl-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-surface-container-high">
                  <span className="text-secondary">Action Strategy: </span>
                  <strong className="text-on-surface font-semibold block text-xs">
                    {item.recommendedAction}
                  </strong>
                  {item.nextFollowUpDate && (
                    <span className="text-tertiary font-label-caps text-[10px] flex items-center gap-1 mt-0.5 font-bold">
                      <Calendar className="w-3 h-3" /> Due: {item.nextFollowUpDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-secondary text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-primary" />
                  <span>Turnaround score: {item.priorityScore}</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                  className="inline-flex items-center gap-1 bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold px-3 py-1 rounded shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Record Outreach</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

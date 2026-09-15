import React from 'react';
import { Calendar, Dumbbell, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface SessionControlsProps {
  date: string;
  onDateChange: (date: string) => void;
  session: string;
  onSessionChange: (session: string) => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  date,
  onDateChange,
  session,
  onSessionChange,
}) => {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 shadow-xs border border-surface-container-low flex flex-col gap-3">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-caps uppercase bg-primary-container text-on-primary px-2 py-0.5 rounded font-bold">
              Mat Command Active
            </span>
            <span className="flex items-center gap-1.5 font-label-md text-secondary">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              Connected to Google Sheets API
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight mt-1 mb-0.5">
            Attendance Management
          </h1>
          <p className="font-body-md text-body-md text-secondary m-0">
            Fast mat-side check-in, session roster recording, and automatic sheet synchronization.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-surface-container-high">
            <Calendar className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="font-label-caps uppercase text-secondary text-[10px] leading-none">
                Session Date ({formatDate(date)})
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent font-label-lg text-on-surface font-bold outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Session Block */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-surface-container-high">
            <Dumbbell className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="font-label-caps uppercase text-secondary text-[10px] leading-none">
                Training Block
              </span>
              <select
                value={session}
                onChange={(e) => onSessionChange(e.target.value)}
                className="bg-transparent font-label-lg text-on-surface font-bold outline-none cursor-pointer"
              >
                <option value="MONDAY">Monday Training</option>
                <option value="TUESDAY">Tuesday Training</option>
                <option value="WEDNESDAY">Wednesday Training</option>
                <option value="THURSDAY">Thursday Training</option>
                <option value="FRIDAY">Friday Training</option>
                <option value="SATURDAY">Saturday Training</option>
                <option value="NO_TRAINING">⚠️ No Training Held Today</option>
                <option value="SPECIAL">Special Seminar / Trials</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="hidden sm:flex items-center gap-2 bg-surface-container-high px-3.5 py-2 rounded-xl">
            <MapPin className="w-5 h-5 text-secondary" />
            <div className="flex flex-col">
              <span className="font-label-caps uppercase text-secondary text-[10px] leading-none">
                Location
              </span>
              <span className="font-label-lg text-on-surface text-xs font-semibold">
                Dojo Mat A, Sub-pitch Gym
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

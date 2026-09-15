import React from 'react';
import { Search } from 'lucide-react';

interface MemberFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  faculty: string;
  onFacultyChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({
  search,
  onSearchChange,
  faculty,
  onFacultyChange,
  status,
  onStatusChange,
}) => {
  const faculties = [
    'ALL',
    'Education',
    'Science',
    'Technology',
    'Arts',
    'Law',
    'Clinical Sciences',
    'Pharmacy',
    'Agriculture',
  ];

  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container-low flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-secondary absolute left-3.5 top-3 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Judoka Name, Nickname, Matric Number, Phone..."
          className="w-full pl-11 pr-24 py-2.5 bg-surface-container-low rounded-xl text-on-surface placeholder:text-secondary font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary border border-transparent outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-secondary hover:text-on-surface font-label-caps bg-surface-container-high px-1.5 py-0.5 rounded cursor-pointer"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
            Activity Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface font-label-md px-3 py-2 rounded-lg outline-none cursor-pointer border border-transparent focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Attending regularly)</option>
            <option value="RECENTLY_INACTIVE">Recently Inactive</option>
            <option value="INACTIVE">Inactive (&gt;30 days)</option>
            <option value="NEVER_ATTENDED">Never Attended</option>
          </select>
        </div>

        {/* Faculty Filter */}
        <div className="flex flex-col gap-1">
          <label className="font-label-caps uppercase text-secondary font-bold text-[11px]">
            Faculty / Dept
          </label>
          <select
            value={faculty}
            onChange={(e) => onFacultyChange(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface font-label-md px-3 py-2 rounded-lg outline-none cursor-pointer border border-transparent focus:border-primary"
          >
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f === 'ALL' ? 'All Faculties' : f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

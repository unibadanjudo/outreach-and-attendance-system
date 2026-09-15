import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, PhoneCall } from 'lucide-react';
import type { DashboardSummary } from '../../types';

interface SummaryCardsProps {
  summary?: DashboardSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const navigate = useNavigate();

  const total = summary?.totalMembers ?? 0;
  const active = summary?.activeMembers ?? 0;
  const inactive = (summary?.recentlyInactiveMembers ?? 0) + (summary?.inactiveMembers ?? 0);
  const queueCount = summary?.membersRequiringOutreach ?? 0;
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Total Judokas */}
      <div
        onClick={() => navigate('/members')}
        className="group relative bg-surface-container-lowest p-4 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-surface-container-low"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-container-highest group-hover:bg-secondary transition-colors" />
        <div className="flex items-start justify-between">
          <span className="font-label-caps text-secondary font-semibold">Total Roster Judokas</span>
          <span className="font-label-caps bg-surface-container text-on-surface px-2 py-0.5 rounded font-bold">Registered</span>
        </div>
        <div className="my-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-metric-xl text-on-surface tracking-tight leading-none">{total}</span>
            <span className="font-label-md text-emerald-600 font-bold">↑ Active Roster</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-2 border-t border-surface-container-low flex items-center justify-between text-secondary font-body-sm">
          <span>All registered club members</span>
          <span className="text-primary font-bold">View List ➔</span>
        </div>
      </div>

      {/* Active Judokas */}
      <div
        onClick={() => navigate('/members')}
        className="group relative bg-surface-container-lowest p-4 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-surface-container-low"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
        <div className="flex items-start justify-between">
          <span className="font-label-caps text-secondary font-semibold">Active Tatami Judokas</span>
          <span className="font-label-caps bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded font-bold">Active {activePct}%</span>
        </div>
        <div className="my-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-metric-xl text-emerald-700 tracking-tight leading-none">{active}</span>
            <span className="font-body-sm text-secondary">/ {total} on mat</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">sports_martial_arts</span>
          </div>
        </div>
        <div className="pt-2 border-t border-surface-container-low flex items-center justify-between text-secondary font-body-sm">
          <span>Attended within last 14 days</span>
          <span className="font-label-caps font-bold text-emerald-700">Healthy</span>
        </div>
      </div>

      {/* Lapsed Members */}
      <div
        onClick={() => navigate('/outreach')}
        className="group relative bg-surface-container-lowest p-4 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between border border-surface-container-low"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div className="flex items-start justify-between">
          <span className="font-label-caps text-secondary font-semibold">Lapsed Members</span>
          <span className="font-label-caps bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded font-bold">At Risk ({inactive})</span>
        </div>
        <div className="my-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-metric-xl text-amber-800 tracking-tight leading-none">{inactive}</span>
            <span className="font-label-md text-amber-700">{Math.round((inactive / (total || 1)) * 100)}% pool</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-2 border-t border-surface-container-low flex items-center justify-between text-secondary font-body-sm">
          <span>{summary?.recentlyInactiveMembers ?? 0} recent • {summary?.inactiveMembers ?? 0} inactive</span>
          <span className="text-primary font-bold">Review ➔</span>
        </div>
      </div>

      {/* Outreach Queue Today */}
      <div
        onClick={() => navigate('/outreach')}
        className="group relative bg-primary-container text-on-primary p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <span className="font-label-caps text-on-primary-container font-bold">Outreach Queue Today</span>
          <span className="font-label-caps bg-surface-container-lowest text-primary px-2 py-0.5 rounded font-bold animate-pulse">URGENT ACTION</span>
        </div>
        <div className="my-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-metric-xl text-on-primary tracking-tight leading-none">{queueCount}</span>
            <span className="font-body-sm text-on-primary-container font-medium">Judokas awaiting</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center text-on-primary">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-on-primary-container font-body-sm">
          <span className="font-semibold text-white">{summary?.followUpsDue ?? 0} follow-ups due</span>
          <span className="font-label-caps bg-surface-container-lowest text-primary px-2 py-0.5 rounded font-bold">START CALLS ➔</span>
        </div>
      </div>
    </section>
  );
};

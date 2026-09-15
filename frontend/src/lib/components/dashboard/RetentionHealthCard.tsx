import React from 'react';
import type { DashboardOutreach, DashboardSummary } from '../../types';

interface RetentionHealthCardProps {
  outreach?: DashboardOutreach;
  summary?: DashboardSummary;
}

export const RetentionHealthCard: React.FC<RetentionHealthCardProps> = ({
  outreach,
  summary,
}) => {
  const rate = outreach?.returnConversionRate ?? 0;
  const returnedCount = outreach?.membersReturnedAfterOutreach ?? 0;
  const trends = summary?.attendanceTrends || {
    increasing: 0,
    stable: 0,
    declining: 0,
    noAttendance: 0,
  };

  const totalOutreach = outreach?.totalOutreach ?? 0;
  const whatsappCount = outreach?.contactMethodBreakdown?.['WHATSAPP'] ?? 0;
  const phoneCount =
    (outreach?.contactMethodBreakdown?.['PHONE_CALL'] ?? 0) +
    (outreach?.contactMethodBreakdown?.['CALL'] ?? 0);
  const smsCount =
    (outreach?.contactMethodBreakdown?.['SMS'] ?? 0) +
    (outreach?.contactMethodBreakdown?.['EMAIL'] ?? 0);

  const whatsappPct = totalOutreach > 0 ? Math.round((whatsappCount / totalOutreach) * 100) : 0;
  const phonePct = totalOutreach > 0 ? Math.round((phoneCount / totalOutreach) * 100) : 0;
  const smsPct = totalOutreach > 0 ? Math.round((smsCount / totalOutreach) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-surface-container-low flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-low">
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface uppercase">
            Retention &amp; Outreach
          </span>
          <span className="font-label-caps text-secondary">
            Active Intervention Pipeline
          </span>
        </div>
        <span className="font-label-caps bg-[#DCFCE7] text-[#166534] px-2 py-1 rounded font-bold">
          {rate > 0 ? 'ACTIVE PIPELINE' : 'MONITORING'}
        </span>
      </div>

      {/* Conversion Ring & Metric */}
      <div className="flex items-center gap-4 my-3">
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-surface-container"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-tertiary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${Math.min(100, rate)}, 100`}
              strokeLinecap="round"
              strokeWidth="3.8"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-headline-sm text-tertiary leading-none font-bold">
              {rate}%
            </span>
            <span className="font-label-caps text-[9px] text-secondary">
              RECOVERED
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label-lg text-label-lg text-on-surface">
            {returnedCount} Judokas Returned to Tatami
          </span>
          <p className="font-body-sm text-body-sm text-secondary m-0">
            Direct coach outreach successfully reactivated lapsed members to training.
          </p>
        </div>
      </div>

      {/* Channel Breakdown Bars */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="font-label-caps uppercase text-secondary font-semibold">
          Outreach Channel Efficiency ({totalOutreach} Total)
        </span>
        {/* WhatsApp */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-label-md text-label-md">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> WhatsApp
            </span>
            <span className="text-on-surface font-semibold">{whatsappCount} Sent • {whatsappPct}% Share</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${whatsappPct}%` }} />
          </div>
        </div>
        {/* Phone Calls */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-label-md text-label-md">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary" /> Phone Calls
            </span>
            <span className="text-on-surface font-semibold">{phoneCount} Calls • {phonePct}% Share</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: `${phonePct}%` }} />
          </div>
        </div>
        {/* Faculty / SMS */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between font-label-md text-label-md">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" /> SMS / Email
            </span>
            <span className="text-on-surface font-semibold">{smsCount} Attempts • {smsPct}% Share</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: `${smsPct}%` }} />
          </div>
        </div>
      </div>

      {/* Trajectory Pills */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-container-low font-label-caps">
        <div className="text-center">
          <span className="text-emerald-700 block font-bold text-sm">
            ↑ {trends.increasing}
          </span>
          <span className="text-secondary">Increasing</span>
        </div>
        <div className="text-center">
          <span className="text-on-surface block font-bold text-sm">
            {trends.stable}
          </span>
          <span className="text-secondary">Stable</span>
        </div>
        <div className="text-center">
          <span className="text-primary block font-bold text-sm">
            ↓ {trends.declining}
          </span>
          <span className="text-secondary">Declining</span>
        </div>
      </div>
    </div>
  );
};

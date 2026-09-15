import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { Button } from '../../lib/components/common/Button';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-xs">
        <span className="font-label-caps bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded font-bold">
          PREFERENCES &amp; CONFIG
        </span>
        <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight mt-1 mb-0">
          Dojo Command Configuration
        </h1>
        <p className="font-body-sm text-secondary m-0 mt-1">
          Staff credentials, Google Sheets integration status, and club operational parameters.
        </p>
      </div>

      {/* Staff Account Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-xs flex flex-col gap-4">
        <h2 className="font-headline-sm uppercase text-on-surface m-0 border-b border-surface-container-low pb-2">
          Staff Operator Profile
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-xl">
            {user?.name?.[0] || 'C'}
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-on-surface font-bold">
              {user?.name || 'Head Coach / Dojo Operator'}
            </span>
            <span className="font-body-sm text-secondary">
              {user?.email || 'staff@uijudo.club'}
            </span>
            <span className="font-label-caps bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold w-fit text-[10px] mt-1">
              AUTHORIZED STAFF
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-surface-container-low flex justify-end">
          <Button variant="outline" onClick={handleLogout} className="text-error border-error/30 hover:bg-error/10">
            Sign Out of Dojo Command
          </Button>
        </div>
      </div>

      {/* Inactivity Detection Rules */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-xs flex flex-col gap-3">
        <h2 className="font-headline-sm uppercase text-on-surface m-0 border-b border-surface-container-low pb-2">
          Retention Threshold Parameters
        </h2>
        <p className="font-body-sm text-secondary m-0">
          These rules are enforced authoritatively by the NestJS backend business logic engine:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="font-label-caps text-emerald-700 font-bold block">ACTIVE</span>
            <span className="font-headline-sm text-on-surface">1 – 14 Days</span>
            <span className="font-body-sm text-secondary text-xs block">Regular mat participant</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="font-label-caps text-amber-700 font-bold block">RECENTLY INACTIVE</span>
            <span className="font-headline-sm text-on-surface">15 – 30 Days</span>
            <span className="font-body-sm text-secondary text-xs block">First check-in notice</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="font-label-caps text-orange-700 font-bold block">INACTIVE</span>
            <span className="font-headline-sm text-on-surface">31 – 60 Days</span>
            <span className="font-body-sm text-secondary text-xs block">High priority follow-up</span>
          </div>
          <div className="bg-surface-container-low p-3 rounded-xl">
            <span className="font-label-caps text-primary font-bold block">LONG-TERM INACTIVE</span>
            <span className="font-headline-sm text-on-surface">&gt; 90 Days</span>
            <span className="font-body-sm text-secondary text-xs block">Re-enrollment protocol</span>
          </div>
        </div>
      </div>

      {/* Google Sheets Integration Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-low shadow-xs flex flex-col gap-3">
        <h2 className="font-headline-sm uppercase text-on-surface m-0 border-b border-surface-container-low pb-2">
          Cloud Spreadsheet Integration
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-lg text-on-surface font-semibold block">
              UI Judo Club Master Google Sheet
            </span>
            <span className="font-body-sm text-secondary text-xs">
              Sheets: "Form Responses 1" (Members), "Attendance", "Outreach"
            </span>
          </div>
          <span className="font-label-caps bg-[#DCFCE7] text-[#166534] px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            LIVE SYNC ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};

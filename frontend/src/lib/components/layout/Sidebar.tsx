import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, ClipboardCheck, Users, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useDashboardSummary } from '../../hooks/useDashboard';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { data: summary } = useDashboardSummary();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, badge: 'LIVE', badgeClass: 'bg-surface-container-high text-on-surface' },
    {
      to: '/outreach',
      label: 'Outreach',
      icon: <PhoneCall className="w-5 h-5 text-primary" />,
      badge: summary?.membersRequiringOutreach ? `${summary.membersRequiringOutreach} DUE` : undefined,
      badgeClass: 'bg-error-container text-on-error-container font-bold',
    },
    { to: '/attendance', label: 'Attendance', icon: <ClipboardCheck className="w-5 h-5" />, badge: 'TODAY', badgeClass: 'bg-surface-container text-on-surface' },
    { to: '/members', label: 'Members', icon: <Users className="w-5 h-5" />, badge: summary?.totalMembers ? String(summary.totalMembers) : undefined, badgeClass: 'text-secondary font-medium' },
    { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const activeJudokas = summary?.activeMembers ?? 0;
  const totalJudokas = summary?.totalMembers ?? 0;
  const activePercent = totalJudokas > 0 ? Math.round((activeJudokas / totalJudokas) * 100) : 0;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 w-72 bg-surface-container-lowest z-40 flex flex-col justify-between p-4 overflow-y-auto shadow-[1px_0_8px_rgba(0,0,0,0.03)] transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="px-2 pt-1">
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">
              Dojo Command Operations
            </span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-label-lg text-label-lg tracking-wide',
                    isActive
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'text-on-surface hover:bg-surface-container hover:text-on-surface',
                  )
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn('font-label-caps text-[10px] px-2 py-0.5 rounded', item.badgeClass)}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Statistics & Judo Philosophy */}
        <div className="flex flex-col gap-4 pt-4 border-t border-surface-container-high">
          <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-secondary font-semibold">Active Mat Members</span>
              <span className="font-label-caps text-label-caps text-primary font-bold">{activePercent}%</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, activePercent))}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-label-md text-label-md text-on-surface">
              <span className="text-secondary">Roster Attendance</span>
              <span className="font-semibold">{activeJudokas} / {totalJudokas}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 font-label-caps text-label-caps text-on-surface">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block animate-ping" />
              <span className="font-semibold">Google Sheets Sync 🟢</span>
            </div>
          </div>

          <div className="px-1 text-center">
            <p className="font-label-caps text-label-caps text-secondary leading-tight">精力善用</p>
            <p className="font-label-caps text-[10px] text-on-surface-variant italic mt-0.5 leading-snug">
              Seiryoku Zen'yo — Maximum Efficiency with Minimum Effort
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

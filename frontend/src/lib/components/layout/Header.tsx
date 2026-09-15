import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUiStore } from '../../stores/useUiStore';
import { useDashboardSummary } from '../../hooks/useDashboard';

function getNextSessionInfo(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const day = now.getDay();
  if (day === 0) return 'Next: Monday 5:00 PM (Dojo Mat A)';
  if (day === 6) return 'Today: Saturday Randori 7:00 AM (Dojo Mat A)';
  return `Today: ${days[day]} Session 5:00 PM (Dojo Mat A)`;
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, setSearchModalOpen } = useUiStore();
  const { data: summary } = useDashboardSummary();

  const outreachCount = summary?.membersRequiringOutreach ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Brand Crest & Title */}
      <div className="flex items-center gap-3 min-w-[240px]">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/crest.svg"
            alt="UI Judo Club Crest"
            className="h-9 w-9 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm uppercase tracking-wide text-primary leading-none">
               UI JUDO CLUB
            </span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
              Attendance &amp; Outreach Command
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Quick Search (Desktop) */}
      <div className="flex-1 max-w-xl mx-auto hidden lg:flex items-center gap-3">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="w-full flex items-center bg-surface-container-low px-3.5 py-1.5 rounded-xl text-secondary hover:bg-surface-container transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 mr-2" />
          <span className="font-body-sm text-body-sm text-secondary">
            Quick member search (Name, Matric, Belt)...
          </span>
          <span className="ml-auto font-label-caps text-label-caps bg-surface-container-highest text-on-surface px-1.5 py-0.5 rounded uppercase shadow-xs">
            ⌘K
          </span>
        </button>
        <div className="hidden xl:flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-label-md text-label-md text-on-surface">
            {getNextSessionInfo()}
          </span>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => navigate('/outreach')}
          className="relative p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
          title="Outreach queue notifications"
        >
          <span className="material-symbols-outlined text-on-surface text-xl">
            notifications
          </span>
          {outreachCount > 0 ? (
            <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-label-caps text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              {outreachCount} due
            </span>
          ) : null}
        </button>

        <div className="h-6 w-px bg-secondary-container hidden sm:block" />

        {/* User Card */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="font-label-lg text-label-lg text-on-surface leading-tight">
                {user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'UI Judo Staff'}
              </span>
              <span className="font-label-caps text-[9px] bg-primary text-on-primary px-1 py-0.2 rounded font-bold">
                {user?.role || 'COACH'}
              </span>
            </div>
            <span className="font-body-sm text-[11px] text-secondary leading-tight">
              {user?.email || 'staff@uijudo.club'}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-secondary hover:text-primary transition-colors ml-1 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

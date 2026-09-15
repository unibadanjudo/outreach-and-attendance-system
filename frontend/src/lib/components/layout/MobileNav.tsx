import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PhoneCall,
  ClipboardCheck,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const MobileNav: React.FC = () => {
  const items = [
    { to: '/', label: 'Command', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/outreach', label: 'Outreach', icon: <PhoneCall className="w-5 h-5" /> },
    { to: '/attendance', label: 'Attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
    { to: '/members', label: 'Members', icon: <Users className="w-5 h-5" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-surface-container-low px-2 py-1.5 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg font-label-caps text-[9px] transition-colors',
              isActive
                ? 'text-primary font-bold'
                : 'text-secondary hover:text-on-surface',
            )
          }
        >
          {item.icon}
          <span className="mt-1">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

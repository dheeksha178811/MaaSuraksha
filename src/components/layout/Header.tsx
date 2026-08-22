import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { mockMother, mockNotifications } from '@/data/mockData';
import { BreadcrumbItem, UserRole } from '@/types';

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  currentRole = 'mother',
  onSwitchRole,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate dynamic breadcrumb based on current pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    if (path.startsWith('/mother')) {
      const sub = path.replace('/mother', '').replace('/', '');
      const formattedSub = sub
        ? sub.charAt(0).toUpperCase() + sub.slice(1).replace(/-/g, ' ')
        : 'Dashboard';
      return [
        { label: 'My care space', href: '/mother/dashboard' },
        { label: formattedSub },
      ];
    }
    if (path.startsWith('/doctor')) {
      return [{ label: 'Clinical Portal', href: '/doctor/dashboard' }, { label: 'Dashboard' }];
    }
    if (path.startsWith('/hospital')) {
      return [{ label: 'Facility Console', href: '/hospital/dashboard' }, { label: 'Dashboard' }];
    }
    if (path.startsWith('/admin')) {
      return [{ label: 'Program Administration', href: '/admin/dashboard' }, { label: 'Overview' }];
    }
    return [{ label: 'Home', href: '/' }];
  };

  const userMenuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'My Profile & Details',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/mother/profile'),
    },
    {
      id: 'role-switch',
      label: 'Switch Role (Mock Demo)',
      icon: <Shield className="w-4 h-4" />,
      onClick: () => navigate('/auth/login'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      divider: true,
      onClick: () => {
        if (onSwitchRole) onSwitchRole('mother');
        navigate('/auth/login');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-18 bg-warm-ivory/80 backdrop-blur-md border-b border-sandal-200/50 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-xl text-warm-muted hover:text-warm-brown hover:bg-warm-cream focus:outline-none focus:ring-2 focus:ring-sandal-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:block">
          <Breadcrumb items={getBreadcrumbs()} />
        </div>
        <div className="sm:hidden font-display text-lg font-semibold text-warm-brown truncate">
          MaaSuraksha
        </div>
      </div>

      {/* Right: Role indicator, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Role Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-verySoft/80 border border-sandal-200/70 text-xs font-medium text-sandal-900">
          <span className="text-warm-muted">Viewing as:</span>
          <span className="font-semibold text-sandal-700 capitalize">
            {currentRole}
          </span>
        </div>

        {/* Notification Bell with Popup */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-warm-muted hover:text-sandal-900 hover:bg-warm-cream focus:outline-none focus:ring-2 focus:ring-sandal-300 cursor-pointer transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sandal-500 ring-2 ring-warm-ivory animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-warm-lg border border-sandal-100 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-warm-brown">
                    Care Notifications
                  </span>
                  <Badge variant="sandal" size="sm">2 New</Badge>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-sandal-600 hover:underline"
                >
                  Close
                </button>
              </div>

              <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-warm-cream/50 hover:bg-warm-cream border border-sandal-100/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-peach-verySoft text-sandal-600 shrink-0 mt-0.5">
                        {n.type === 'vaccination_reminder' ? (
                          <Sparkles className="w-3.5 h-3.5" />
                        ) : (
                          <HeartHandshake className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-warm-brown truncate">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-warm-muted leading-relaxed mt-0.5">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-sandal-600/80 font-medium block mt-1">
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-sandal-100 text-center">
                <span className="text-[11px] text-warm-muted">
                  Routine reminders for Ananya & baby Vihaan
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-sandal-200/60 hidden sm:block" />

        {/* User Profile dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-warm-cream transition-colors group">
              <Avatar
                name={mockMother.name}
                size="sm"
                className="border border-sandal-300 shadow-subtle"
              />
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-warm-brown group-hover:text-sandal-900 truncate max-w-[120px]">
                  {mockMother.name}
                </span>
                <span className="text-[10px] font-medium text-warm-muted mt-0.5">
                  Mother
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-warm-muted group-hover:text-sandal-900 transition-colors" />
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};

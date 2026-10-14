import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { NotificationBell } from './NotificationBell';
import { BreadcrumbItem, UserRole } from '@/types';
import { useMockAuth } from '@/hooks/useMockAuth';

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
  currentRole?: UserRole;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  currentRole = 'mother',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useMockAuth();

  const profileRouteByRole: Record<UserRole, string> = {
    mother: '/mother/profile',
    doctor: '/doctor/profile',
    hospital: '/hospital/profile',
    admin: '/admin/profile',
  };

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
      const sub = path.replace('/doctor', '').replace('/', '');
      const firstSegment = sub.split('/')[0];
      const formattedSub = firstSegment
        ? firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1).replace(/-/g, ' ')
        : 'Dashboard';
      return [
        { label: 'Clinical Portal', href: '/doctor/dashboard' },
        { label: formattedSub },
      ];
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
      onClick: () => navigate(profileRouteByRole[currentRole]),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      divider: true,
      onClick: () => {
        logout();
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

        {/* Notification Bell with Popup (real, GET /api/notifications) */}
        <NotificationBell role={currentRole} />

        <div className="h-6 w-px bg-sandal-200/60 hidden sm:block" />

        {/* User Profile dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-warm-cream transition-colors group">
              <Avatar
                name={user.name}
                size="sm"
                className="border border-sandal-300 shadow-subtle"
              />
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-warm-brown group-hover:text-sandal-900 truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[10px] font-medium text-warm-muted mt-0.5 capitalize">
                  {currentRole}
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

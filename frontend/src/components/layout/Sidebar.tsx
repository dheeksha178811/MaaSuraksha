import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, HeartHandshake } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getNavConfigForRole } from '@/routes/navigationItems';
import { Badge } from '@/components/ui/Badge';
import { useMockAuth } from '@/hooks/useMockAuth';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  className,
}) => {
  const location = useLocation();
  const { role } = useMockAuth();
  const { items: navItems, bottomItems: bottomNavItems, sectionLabel } = getNavConfigForRole(role);

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col bg-warm-cream/90 border-r border-sandal-200/60 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out select-none',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-18 px-4 flex items-center justify-between border-b border-sandal-200/50">
        <NavLink
          to="/"
          className={cn(
            'flex items-center gap-3 transition-opacity overflow-hidden',
            isCollapsed && 'justify-center w-full'
          )}
          title="MaaSuraksha Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-sandal-500 text-white flex items-center justify-center shrink-0 shadow-warm-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none truncate">
              <span className="font-display text-xl font-bold tracking-tight text-warm-brown">
                MaaSuraksha
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-sandal-600 mt-0.5">
                Maternal Care
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <div className="absolute -right-3.5 top-6 z-40 hidden md:block">
        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-7 h-7 rounded-full bg-white border border-sandal-200 text-warm-muted hover:text-sandal-900 hover:border-sandal-400 shadow-subtle flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-sandal-300 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Links (Scrollable area) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-warm-muted/80">
            {sectionLabel}
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.title}
              to={item.href}
              title={isCollapsed ? item.title : undefined}
              className={({ isActive: linkActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
                  linkActive || isActive
                    ? 'bg-white text-sandal-900 shadow-subtle font-semibold border border-sandal-100'
                    : 'text-warm-muted hover:bg-white/60 hover:text-sandal-900'
                )
              }
            >
              <span
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-sandal-600' : 'text-warm-muted group-hover:text-sandal-600'
                )}
              >
                <Icon className="w-5 h-5" />
              </span>

              {!isCollapsed && (
                <span className="truncate flex-1">{item.title}</span>
              )}

              {!isCollapsed && item.badge && (
                <Badge
                  variant={item.badge === 'Due' ? 'sandal' : 'warm'}
                  size="sm"
                  className="ml-auto"
                >
                  {item.badge}
                </Badge>
              )}

              {/* Collapsed active dot */}
              {isCollapsed && isActive && (
                <span className="absolute right-2 top-2.5 w-1.5 h-1.5 rounded-full bg-sandal-500" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Area (Settings, Logout) */}
      <div className="p-3 border-t border-sandal-200/50 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.title}
              to={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-white text-sandal-900 shadow-subtle font-semibold'
                  : item.title === 'Logout'
                  ? 'text-rose-700/80 hover:bg-rose-50 hover:text-rose-800'
                  : 'text-warm-muted hover:bg-white/60 hover:text-sandal-900'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

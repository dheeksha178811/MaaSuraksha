import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { X, HeartHandshake } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  MOTHER_NAV_ITEMS,
  BOTTOM_NAV_ITEMS,
  DOCTOR_NAV_ITEMS,
  DOCTOR_BOTTOM_NAV_ITEMS,
} from '@/routes/navigationItems';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { useMockAuth } from '@/hooks/useMockAuth';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { role } = useMockAuth();
  const isDoctor = role === 'doctor';
  const navItems = isDoctor ? DOCTOR_NAV_ITEMS : MOTHER_NAV_ITEMS;
  const bottomNavItems = isDoctor ? DOCTOR_BOTTOM_NAV_ITEMS : BOTTOM_NAV_ITEMS;
  const sectionLabel = isDoctor ? 'Clinical Navigation' : 'Care Navigation';

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-warm-brown/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-warm-cream border-r border-sandal-200/80 shadow-warm-lg flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-sandal-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sandal-500 text-white flex items-center justify-center shadow-warm-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-warm-brown block">
                MaaSuraksha
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-sandal-600">
                Maternal Care
              </span>
            </div>
          </div>
          <IconButton
            aria-label="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-warm-muted" />
          </IconButton>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-warm-muted/80">
            {sectionLabel}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <NavLink
                key={item.title}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-sandal-900 shadow-subtle font-semibold border border-sandal-100'
                    : 'text-warm-muted hover:bg-white/60 hover:text-sandal-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0',
                    isActive ? 'text-sandal-600' : 'text-warm-muted'
                  )}
                />
                <span className="truncate flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="sandal" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom items */}
        <div className="p-4 border-t border-sandal-200/60 space-y-1 bg-warm-ivory/50">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.title}
                to={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-warm-muted hover:bg-white/60 hover:text-sandal-900 transition-colors"
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

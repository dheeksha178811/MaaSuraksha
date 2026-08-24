import React from 'react';
import { LucideIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { UserRole } from '@/types';

export interface RoleCardProps {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  isSelected?: boolean;
  onSelect: (role: UserRole) => void;
  className?: string;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  title,
  subtitle,
  description,
  icon: Icon,
  isSelected = false,
  onSelect,
  className,
}) => {
  return (
    <div
      onClick={() => onSelect(role)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(role);
        }
      }}
      className={cn(
        'group relative flex flex-col p-5 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-200 cursor-pointer border text-left outline-none focus:ring-2 focus:ring-sandal-400',
        isSelected
          ? 'bg-white border-sandal-500 shadow-warm-md ring-2 ring-sandal-400/30'
          : 'bg-white/85 border-sandal-100 hover:border-sandal-300 hover:bg-white hover:shadow-warm-sm',
        className
      )}
    >
      {/* Selection indicator */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
            isSelected
              ? 'bg-sandal-500 text-white shadow-warm-sm'
              : 'bg-peach-verySoft text-sandal-600 group-hover:bg-peach-soft'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div
          className={cn(
            'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
            isSelected
              ? 'border-sandal-500 bg-sandal-500 text-white'
              : 'border-sandal-200 bg-white group-hover:border-sandal-300'
          )}
        >
          {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-sandal-500" />}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sandal-600 block">
          {subtitle}
        </span>
        <h4 className="font-display text-lg sm:text-xl font-semibold text-warm-brown group-hover:text-sandal-900 transition-colors">
          {title}
        </h4>
      </div>

      <p className="text-xs sm:text-sm text-warm-muted leading-relaxed mt-2.5">
        {description}
      </p>

      {isSelected && (
        <div className="mt-4 pt-3 border-t border-sandal-100/70 flex items-center justify-between text-xs font-semibold text-sandal-700">
          <span>Ready to continue</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
};

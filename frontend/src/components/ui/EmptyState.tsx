import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  moduleBadge?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  moduleBadge,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white border border-sandal-100/80 shadow-warm-sm max-w-xl mx-auto',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-peach-verySoft border border-peach-soft flex items-center justify-center text-sandal-600 mb-4 shadow-subtle">
        <Icon className="w-8 h-8" />
      </div>

      {moduleBadge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-warm-cream text-sandal-800 border border-sandal-200 mb-3">
          {moduleBadge}
        </span>
      )}

      <h3 className="font-display text-xl sm:text-2xl font-semibold text-warm-brown mb-2">
        {title}
      </h3>

      <p className="text-sm text-warm-muted leading-relaxed max-w-md mb-6">
        {description}
      </p>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};

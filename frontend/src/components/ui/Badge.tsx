import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'sandal', size = 'md', children, ...props }, ref) => {
    const variants = {
      sandal: 'bg-sandal-100 text-sandal-900 border border-sandal-200',
      sage: 'bg-sage-soft text-sage-text border border-sage/40',
      peach: 'bg-peach-verySoft text-sandal-800 border border-peach-soft',
      warm: 'bg-warm-cream text-warm-brown border border-sandal-100',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200',
      outline: 'bg-transparent text-warm-muted border border-sandal-200',
    };

    const sizes = {
      sm: 'text-[11px] px-2 py-0.5 font-medium',
      md: 'text-xs px-2.5 py-1 font-medium',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full leading-none tracking-wide transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

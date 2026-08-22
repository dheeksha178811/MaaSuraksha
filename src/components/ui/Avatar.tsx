import React from 'react';
import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/formatters';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  indicator?: 'online' | 'busy' | 'away';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, src, size = 'md', indicator, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base font-medium',
      xl: 'w-16 h-16 text-lg font-semibold',
    };

    const indicatorColors = {
      online: 'bg-emerald-500',
      busy: 'bg-amber-500',
      away: 'bg-stone-400',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-full bg-peach-soft text-sandal-900 border-2 border-white shadow-subtle overflow-hidden select-none font-sans',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Hide broken image to fallback to initials
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="font-semibold">{getInitials(name)}</span>
        )}

        {indicator && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-white',
              indicatorColors[indicator]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

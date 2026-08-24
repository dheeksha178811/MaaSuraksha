import React from 'react';
import { cn } from '@/utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
  label,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px h-full bg-sandal-200/70', className)}
        role="separator"
        aria-orientation="vertical"
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center py-2', className)} {...props}>
        <div className="flex-grow border-t border-sandal-200/70" />
        <span className="flex-shrink mx-4 text-[11px] font-semibold tracking-wider uppercase text-warm-muted">
          {label}
        </span>
        <div className="flex-grow border-t border-sandal-200/70" />
      </div>
    );
  }

  return (
    <div
      className={cn('w-full border-t border-sandal-200/70 my-4', className)}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  );
};

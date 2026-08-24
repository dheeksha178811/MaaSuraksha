import React from 'react';
import { cn } from '@/utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      shape = 'rounded',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const shapes = {
      circle: 'rounded-full',
      rounded: 'rounded-xl',
    };

    const variants = {
      primary: 'bg-sandal-500 hover:bg-sandal-600 text-white shadow-sm focus:ring-sandal-400',
      secondary: 'bg-peach-verySoft hover:bg-peach-soft text-sandal-900 border border-sandal-200 focus:ring-sandal-300',
      outline: 'border border-sandal-300 hover:border-sandal-500 bg-white hover:bg-warm-cream text-sandal-900 focus:ring-sandal-300',
      ghost: 'text-warm-muted hover:text-sandal-900 hover:bg-warm-cream focus:ring-sandal-300',
    };

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          shapes[shape],
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

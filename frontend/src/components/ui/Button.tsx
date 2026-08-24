import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants = {
      primary: 'bg-sandal-500 hover:bg-sandal-600 text-white shadow-sm hover:shadow-warm-sm focus:ring-sandal-400 active:scale-[0.98]',
      secondary: 'bg-peach-verySoft hover:bg-peach-soft text-sandal-900 border border-sandal-200 focus:ring-sandal-300 active:scale-[0.98]',
      outline: 'border border-sandal-300 hover:border-sandal-500 bg-white/80 hover:bg-warm-cream text-sandal-900 focus:ring-sandal-300 active:scale-[0.98]',
      ghost: 'text-sandal-900 hover:bg-warm-cream/80 hover:text-sandal-700 focus:ring-sandal-300',
      sage: 'bg-sage-soft hover:bg-sage text-sage-dark focus:ring-sage-text active:scale-[0.98]',
      danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 focus:ring-rose-400',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

import React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onChange, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex w-10 h-6 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sandal-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          checked ? 'bg-sandal-500' : 'bg-sandal-200',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 inline-block w-5 h-5 rounded-full bg-white shadow-subtle transform transition-transform duration-200',
            checked && 'translate-x-4'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

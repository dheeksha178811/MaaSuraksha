import React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ToastProps {
  id?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  const icons = {
    info: <Info className="w-5 h-5 text-sandal-600 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-sage-text shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  };

  const borders = {
    info: 'border-sandal-200 bg-white',
    success: 'border-sage/50 bg-white',
    warning: 'border-amber-200 bg-white',
    error: 'border-rose-200 bg-white',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl shadow-warm-md border max-w-sm transition-all',
        borders[type],
        className
      )}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 space-y-0.5">
        <h5 className="text-xs sm:text-sm font-semibold text-warm-brown">{title}</h5>
        {message && <p className="text-xs text-warm-muted leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-warm-muted hover:text-warm-brown transition-colors p-0.5 rounded-lg"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

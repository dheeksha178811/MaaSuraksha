import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AssistantLauncherProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export const AssistantLauncher: React.FC<AssistantLauncherProps> = ({
  isOpen,
  onClick,
  unreadCount = 0,
}) => {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none">
      <button
        onClick={onClick}
        aria-label={isOpen ? 'Close MaaSuraksha Assistant' : 'Open MaaSuraksha Assistant'}
        aria-expanded={isOpen}
        className={cn(
          'group relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-sandal-300/60',
          'h-13 w-13 sm:h-14 sm:w-14 bg-sandal-500 hover:bg-sandal-600 text-white shadow-warm-lg hover:shadow-warm-md hover:scale-105 active:scale-95',
          isOpen && 'bg-sandal-600 ring-2 ring-warm-ivory'
        )}
      >
        {/* Subtle breathing glow ring when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-sandal-400/25 animate-pulse -z-10 pointer-events-none" />
        )}

        {/* Launcher Icon transition */}
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200 rotate-90 animate-in zoom-in-75" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </div>
        )}

        {/* Accessible visual tooltip on desktop hover when closed */}
        {!isOpen && (
          <div className="hidden lg:group-hover:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-warm-brown text-white text-xs font-medium whitespace-nowrap shadow-warm-md pointer-events-none animate-in fade-in slide-in-from-right-1 duration-150">
            <span>MaaSuraksha Assistant</span>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-warm-brown" />
          </div>
        )}
      </button>
    </div>
  );
};

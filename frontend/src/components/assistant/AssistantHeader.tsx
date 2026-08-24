import React from 'react';
import { Sparkles, X, RotateCcw, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui/Badge';

export interface AssistantHeaderProps {
  role: UserRole;
  onClose: () => void;
  onReset: () => void;
}

const ROLE_LABELS: Record<UserRole, { badge: string; subtitle: string }> = {
  mother: { badge: 'Mother Care', subtitle: 'Your maternal care companion' },
  doctor: { badge: 'Clinical Space', subtitle: 'Clinical workflow assistant' },
  hospital: { badge: 'Hospital Space', subtitle: 'Facility coordination assistant' },
  admin: { badge: 'Admin Space', subtitle: 'Program oversight assistant' },
};

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  role,
  onClose,
  onReset,
}) => {
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.mother;

  return (
    <div className="border-b border-sandal-200/80 bg-white/95 backdrop-blur-md shrink-0">
      {/* Main Top Header Bar */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-peach-verySoft border border-sandal-200 text-sandal-600 flex items-center justify-center shrink-0 shadow-subtle">
            <Sparkles className="w-4.5 h-4.5 text-sandal-600" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-warm-brown truncate">
                MaaSuraksha Assistant
              </h3>
              <Badge variant="sandal" size="sm" className="hidden sm:inline-flex text-[10px] py-0 px-2">
                {roleInfo.badge}
              </Badge>
            </div>
            <span className="text-[11px] text-warm-muted truncate mt-0.5">
              {roleInfo.subtitle}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onReset}
            type="button"
            aria-label="Restart conversation"
            title="Restart conversation"
            className="p-1.5 rounded-xl text-warm-muted hover:text-warm-brown hover:bg-warm-cream transition-colors focus:outline-none focus:ring-2 focus:ring-sandal-300 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close assistant"
            title="Close assistant"
            className="p-1.5 rounded-xl text-warm-muted hover:text-warm-brown hover:bg-warm-cream transition-colors focus:outline-none focus:ring-2 focus:ring-sandal-300 cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Safety & Demo Notice Bar */}
      <div className="px-4 py-1.5 bg-peach-verySoft/60 border-t border-sandal-100/60 flex items-center gap-1.5 text-[10px] text-sandal-800">
        <ShieldAlert className="w-3 h-3 text-sandal-600 shrink-0" />
        <span className="truncate">
          Demonstration companion • For medical emergencies, consult your doctor
        </span>
      </div>
    </div>
  );
};

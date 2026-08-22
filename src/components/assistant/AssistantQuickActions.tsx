import React from 'react';
import {
  CalendarCheck,
  Syringe,
  CalendarDays,
  Activity,
  Stethoscope,
  Landmark,
  UserCheck,
  Users,
  MessageCircle,
  Building2,
  Clock,
  Bell,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { AssistantQuickAction } from '@/types';

export interface AssistantQuickActionsProps {
  actions: AssistantQuickAction[];
  onSelectAction: (action: AssistantQuickAction) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarCheck,
  Syringe,
  CalendarDays,
  Activity,
  Stethoscope,
  Landmark,
  UserCheck,
  Users,
  MessageCircle,
  Building2,
  Clock,
  Bell,
  ShieldCheck,
  BarChart3,
};

export const AssistantQuickActions: React.FC<AssistantQuickActionsProps> = ({
  actions,
  onSelectAction,
  disabled = false,
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-warm-muted px-1">
        <span>Suggested Actions</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => {
          const Icon = (action.iconName && ICON_MAP[action.iconName]) || HelpCircle;

          return (
            <button
              key={action.id}
              onClick={() => onSelectAction(action)}
              disabled={disabled}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-peach-verySoft/80 border border-sandal-200/80 hover:border-sandal-400 text-xs font-medium text-warm-brown hover:text-sandal-900 transition-all duration-150 shadow-subtle active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left"
            >
              <Icon className="w-3.5 h-3.5 text-sandal-600 shrink-0" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

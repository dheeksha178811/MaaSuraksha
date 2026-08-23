import React from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NutritionReminder } from '@/types';

export interface ReminderRowProps {
  reminder: NutritionReminder;
  onToggle: (reminder: NutritionReminder) => void;
}

export const ReminderRow: React.FC<ReminderRowProps> = ({ reminder, onToggle }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-warm-cream/50 border border-sandal-100">
      <div className="min-w-0">
        <h5 className="text-sm font-semibold text-warm-brown">{reminder.title}</h5>
        <p className="text-xs text-warm-muted mt-0.5">{reminder.description}</p>
        <span className="flex items-center gap-1 text-[11px] text-sandal-700 mt-1">
          <Clock className="w-3 h-3" />
          {reminder.timing}
        </span>
      </div>
      <Button
        size="sm"
        variant={reminder.enabled ? 'secondary' : 'outline'}
        leftIcon={reminder.enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        onClick={() => onToggle(reminder)}
        className="shrink-0"
      >
        {reminder.enabled ? 'Reminder On' : 'Turn On'}
      </Button>
    </div>
  );
};

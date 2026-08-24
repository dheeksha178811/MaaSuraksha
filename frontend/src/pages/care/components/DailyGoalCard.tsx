import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { DailyGoalItem } from '@/types';
import { getDailyGoalCategoryIcon } from '@/pages/care/nutritionUi';

export interface DailyGoalCardProps {
  goal: DailyGoalItem;
  onIncrement: (goal: DailyGoalItem) => void;
  onDecrement: (goal: DailyGoalItem) => void;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({ goal, onIncrement, onDecrement }) => {
  const CategoryIcon = getDailyGoalCategoryIcon(goal.category);
  const isComplete = goal.completedCount >= goal.targetCount;
  const progressPct = Math.min(100, Math.round((goal.completedCount / goal.targetCount) * 100));

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center">
          <CategoryIcon className="w-4.5 h-4.5" />
        </div>
        {isComplete && <Badge variant="sage" size="sm">Done</Badge>}
      </div>

      <div>
        <h4 className="font-display font-semibold text-warm-brown text-sm">{goal.title}</h4>
        <p className="text-xs text-warm-muted mt-0.5">
          {goal.completedCount} of {goal.targetCount} — {goal.targetLabel}
        </p>
      </div>

      <div className="h-2 rounded-full bg-warm-cream overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', isComplete ? 'bg-sage' : 'bg-sandal-400')}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <IconButton
          aria-label={`Decrease ${goal.title}`}
          variant="outline"
          size="sm"
          onClick={() => onDecrement(goal)}
          disabled={goal.completedCount <= 0}
        >
          <Minus className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          aria-label={`Increase ${goal.title}`}
          variant="outline"
          size="sm"
          onClick={() => onIncrement(goal)}
          disabled={goal.completedCount >= goal.targetCount}
        >
          <Plus className="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </Card>
  );
};

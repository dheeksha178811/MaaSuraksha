import React from 'react';
import { AlertTriangle, Clock, Repeat } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ExerciseGuidanceItem } from '@/types';
import {
  getExerciseCategoryIcon,
  getExerciseClearanceBadgeVariant,
  getExerciseClearanceLabel,
} from '@/pages/care/nutritionUi';

export interface ExerciseGuidanceCardProps {
  exercise: ExerciseGuidanceItem;
}

export const ExerciseGuidanceCard: React.FC<ExerciseGuidanceCardProps> = ({ exercise }) => {
  const CategoryIcon = getExerciseCategoryIcon(exercise.category);

  return (
    <Card variant="default" padding="md" className="space-y-2.5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{exercise.name}</h4>
            <Badge variant={getExerciseClearanceBadgeVariant(exercise.clearance)} size="sm">
              {getExerciseClearanceLabel(exercise.clearance)}
            </Badge>
          </div>
          <p className="text-xs text-warm-muted leading-relaxed">{exercise.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted pt-1">
            <span className="flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-sandal-500" />
              {exercise.recommendedFrequency}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sandal-500" />
              {exercise.recommendedDuration}
            </span>
          </div>
          {exercise.safetyNote && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-800 leading-relaxed">{exercise.safetyNote}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FoodGuidanceItem } from '@/types';
import { getFoodCategoryIcon, getFoodCategoryLabel } from '@/pages/care/nutritionUi';

export interface FoodGuidanceCardProps {
  food: FoodGuidanceItem;
}

export const FoodGuidanceCard: React.FC<FoodGuidanceCardProps> = ({ food }) => {
  const CategoryIcon = getFoodCategoryIcon(food.category);
  const isRecommended = food.type === 'RECOMMENDED';

  return (
    <Card variant="default" padding="md" className="space-y-2.5">
      <div className="flex items-start gap-3">
        <div
          className={
            isRecommended
              ? 'w-10 h-10 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center shrink-0'
              : 'w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0'
          }
        >
          <CategoryIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{food.name}</h4>
            <Badge variant={isRecommended ? 'sage' : 'danger'} size="sm">
              {isRecommended ? 'Recommended' : 'Limit'}
            </Badge>
            <Badge variant="outline" size="sm">{getFoodCategoryLabel(food.category)}</Badge>
          </div>
          <p className="text-xs text-warm-muted leading-relaxed">{food.description}</p>
          {food.examples && food.examples.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {food.examples.map((example) => (
                <span
                  key={example}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-warm-cream text-warm-brown border border-sandal-100"
                >
                  {example}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

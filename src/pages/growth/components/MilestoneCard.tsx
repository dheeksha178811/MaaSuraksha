import React from 'react';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { MilestoneRecord } from '@/types';
import {
  getMilestoneCategoryIcon,
  getMilestoneCategoryLabel,
  getMilestoneStatusBadgeVariant,
  getMilestoneStatusLabel,
  getRecipientIcon,
  getRecipientLabel,
} from '@/pages/growth/growthUi';

export interface MilestoneCardProps {
  milestone: MilestoneRecord;
  onView: (milestone: MilestoneRecord) => void;
  onMarkAchieved?: (milestone: MilestoneRecord) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onView, onMarkAchieved }) => {
  const CategoryIcon = getMilestoneCategoryIcon(milestone.category);
  const RecipientIcon = getRecipientIcon(milestone.recipientType);
  const canMarkAchieved = onMarkAchieved && milestone.status !== 'achieved' && milestone.category !== 'MATERNAL_RECOVERY';

  return (
    <Card variant="interactive" className="hover:shadow-warm-md">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <CategoryIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{milestone.title}</h4>
            <Badge variant={getMilestoneStatusBadgeVariant(milestone.status)} size="sm">
              {getMilestoneStatusLabel(milestone.status)}
            </Badge>
            <Badge variant="outline" size="sm">{getMilestoneCategoryLabel(milestone.category)}</Badge>
          </div>

          <p className="text-xs text-warm-muted leading-relaxed line-clamp-2">{milestone.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-sandal-500" />
              {milestone.status === 'achieved' && milestone.achievedDate
                ? `Achieved ${formatDate(milestone.achievedDate)}`
                : `Target: ${milestone.targetAgeRange}`}
            </span>
            <span className="flex items-center gap-1.5">
              <RecipientIcon className="w-3.5 h-3.5 text-sandal-500" />
              {getRecipientLabel(milestone.recipientType)} • {milestone.recipientName}
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0 sm:w-40 w-full">
          <Button size="sm" variant="outline" fullWidth onClick={() => onView(milestone)}>
            View Details
          </Button>
          {canMarkAchieved && (
            <Button
              size="sm"
              variant="ghost"
              fullWidth
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => onMarkAchieved(milestone)}
            >
              Mark Achieved
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

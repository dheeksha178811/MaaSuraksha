import React from 'react';
import { CalendarClock, CheckCircle2, NotebookPen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
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

interface MilestoneDetailsModalProps {
  milestone: MilestoneRecord;
  onClose: () => void;
  onMarkAchieved?: (milestone: MilestoneRecord) => void;
}

export const MilestoneDetailsModal: React.FC<MilestoneDetailsModalProps> = ({
  milestone,
  onClose,
  onMarkAchieved,
}) => {
  const CategoryIcon = getMilestoneCategoryIcon(milestone.category);
  const RecipientIcon = getRecipientIcon(milestone.recipientType);
  const canMarkAchieved = onMarkAchieved && milestone.status !== 'achieved' && milestone.category !== 'MATERNAL_RECOVERY';

  return (
    <Modal isOpen onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{milestone.title}</h2>
            <p className="text-sm text-warm-muted mt-0.5">{getMilestoneCategoryLabel(milestone.category)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={getMilestoneStatusBadgeVariant(milestone.status)} size="sm">
            {getMilestoneStatusLabel(milestone.status)}
          </Badge>
          <Badge variant="outline" size="sm">
            {getRecipientLabel(milestone.recipientType)} • {milestone.recipientName}
          </Badge>
        </div>

        <p className="text-sm text-warm-brown leading-relaxed">{milestone.description}</p>

        <Card className="bg-warm-ivory border-sandal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <CalendarClock className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">
                  {milestone.status === 'achieved' ? 'Achieved On' : 'Typical Age Range'}
                </p>
                <p className="text-sm font-semibold text-warm-brown">
                  {milestone.status === 'achieved' && milestone.achievedDate
                    ? formatDate(milestone.achievedDate)
                    : milestone.targetAgeRange}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <RecipientIcon className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">For</p>
                <p className="text-sm font-semibold text-warm-brown">{milestone.recipientName}</p>
              </div>
            </div>
          </div>
        </Card>

        {milestone.notes && (
          <div className="flex gap-3 p-3 rounded-xl bg-peach-verySoft/60 border border-peach-soft">
            <NotebookPen className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sandal-900 leading-relaxed">{milestone.notes}</p>
          </div>
        )}

        {milestone.category === 'MATERNAL_RECOVERY' && milestone.status !== 'achieved' && (
          <p className="text-xs text-warm-muted italic">
            This milestone is confirmed by your doctor at your scheduled visit — it can't be marked complete from here.
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-sandal-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canMarkAchieved && (
            <Button
              variant="secondary"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => onMarkAchieved(milestone)}
            >
              Mark as Achieved Today
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

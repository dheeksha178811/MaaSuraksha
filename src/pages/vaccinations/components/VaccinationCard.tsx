import React from 'react';
import { Bell, BellOff, CalendarClock, Syringe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { MotherVaccinationRecord } from '@/types';
import {
  getRecipientIcon,
  getRecipientLabel,
  getVaccineStatusBadgeVariant,
  getVaccineStatusLabel,
} from '@/pages/vaccinations/motherVaccinationUi';

export interface VaccinationCardProps {
  vaccination: MotherVaccinationRecord;
  onView: (vaccination: MotherVaccinationRecord) => void;
  onToggleReminder?: (vaccination: MotherVaccinationRecord) => void;
}

export const VaccinationCard: React.FC<VaccinationCardProps> = ({
  vaccination,
  onView,
  onToggleReminder,
}) => {
  const RecipientIcon = getRecipientIcon(vaccination.recipientType);
  const showReminderToggle = onToggleReminder && vaccination.status !== 'completed';

  return (
    <Card variant="interactive" className="hover:shadow-warm-md">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <Syringe className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{vaccination.vaccineName}</h4>
            <Badge variant={getVaccineStatusBadgeVariant(vaccination.status)} size="sm">
              {getVaccineStatusLabel(vaccination.status)}
            </Badge>
          </div>

          <p className="text-xs text-warm-muted">{vaccination.doseLabel}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-sandal-500" />
              {vaccination.status === 'completed' && vaccination.givenDate
                ? `Given ${formatDate(vaccination.givenDate)}`
                : `Due ${formatDate(vaccination.recommendedDate)}`}
            </span>
            <span className="flex items-center gap-1.5">
              <RecipientIcon className="w-3.5 h-3.5 text-sandal-500" />
              {getRecipientLabel(vaccination.recipientType)} • {vaccination.recipientName}
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0 sm:w-40 w-full">
          <Button size="sm" variant="outline" fullWidth onClick={() => onView(vaccination)}>
            View Details
          </Button>
          {showReminderToggle && (
            <Button
              size="sm"
              variant="ghost"
              fullWidth
              leftIcon={vaccination.reminderEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              onClick={() => onToggleReminder(vaccination)}
            >
              {vaccination.reminderEnabled ? 'Reminder On' : 'Remind Me'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

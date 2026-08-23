import React from 'react';
import { Bell, BellOff, CalendarClock, MapPin, NotebookPen, Stethoscope, Syringe } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
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

interface VaccinationDetailsModalProps {
  vaccination: MotherVaccinationRecord;
  onClose: () => void;
  onToggleReminder?: (vaccination: MotherVaccinationRecord) => void;
}

export const VaccinationDetailsModal: React.FC<VaccinationDetailsModalProps> = ({
  vaccination,
  onClose,
  onToggleReminder,
}) => {
  const RecipientIcon = getRecipientIcon(vaccination.recipientType);
  const showReminderToggle = onToggleReminder && vaccination.status !== 'completed';

  return (
    <Modal isOpen onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{vaccination.vaccineName}</h2>
            <p className="text-sm text-warm-muted mt-0.5">{vaccination.doseLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={getVaccineStatusBadgeVariant(vaccination.status)} size="sm">
            {getVaccineStatusLabel(vaccination.status)}
          </Badge>
          <Badge variant="outline" size="sm">
            {getRecipientLabel(vaccination.recipientType)} • {vaccination.recipientName}
          </Badge>
        </div>

        <Card className="bg-warm-ivory border-sandal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <CalendarClock className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">
                  {vaccination.status === 'completed' ? 'Given On' : 'Recommended Date'}
                </p>
                <p className="text-sm font-semibold text-warm-brown">
                  {vaccination.status === 'completed' && vaccination.givenDate
                    ? formatDate(vaccination.givenDate)
                    : formatDate(vaccination.recommendedDate)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <RecipientIcon className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">For</p>
                <p className="text-sm font-semibold text-warm-brown">{vaccination.recipientName}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Stethoscope className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">
                  {vaccination.status === 'completed' ? 'Administered By' : 'Care Team'}
                </p>
                <p className="text-sm font-semibold text-warm-brown">
                  {vaccination.administeredBy || vaccination.doctorName}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Location</p>
                <p className="text-sm font-semibold text-warm-brown">{vaccination.location}</p>
                <p className="text-xs text-warm-muted">{vaccination.hospitalName}</p>
              </div>
            </div>
          </div>
        </Card>

        {vaccination.notes && (
          <div className="flex gap-3 p-3 rounded-xl bg-peach-verySoft/60 border border-peach-soft">
            <NotebookPen className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sandal-900 leading-relaxed">{vaccination.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-sandal-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {showReminderToggle && (
            <Button
              variant="secondary"
              leftIcon={vaccination.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              onClick={() => onToggleReminder(vaccination)}
            >
              {vaccination.reminderEnabled ? 'Reminder On' : 'Set Reminder'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import { AlertTriangle, CalendarRange, Clock, Pill, Stethoscope } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { MotherMedication } from '@/types';
import { getMedicationStatusBadgeVariant, getMedicationStatusLabel } from '@/pages/medications/motherMedicationUi';

export interface MedicationCardProps {
  medication: MotherMedication;
  onView: (medication: MotherMedication) => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({ medication, onView }) => {
  return (
    <Card variant="interactive" className="hover:shadow-warm-md">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <Pill className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{medication.name}</h4>
            <Badge variant={getMedicationStatusBadgeVariant(medication.status)} size="sm">
              {getMedicationStatusLabel(medication.status)}
            </Badge>
            {medication.caution && (
              <Badge variant="danger" size="sm" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Caution
              </Badge>
            )}
          </div>

          <p className="text-xs text-warm-muted">
            {medication.dosage} • {medication.frequency}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sandal-500" />
              {medication.timing}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-sandal-500" />
              {formatDate(medication.startDate)}
              {medication.endDate ? ` – ${formatDate(medication.endDate)}` : ' – ongoing'}
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-sandal-500" />
              {medication.doctorName}
            </span>
          </div>

          {medication.childName && (
            <p className="text-xs text-sandal-700 italic">For {medication.childName}</p>
          )}
        </div>

        <div className="shrink-0 sm:w-36 w-full">
          <Button size="sm" variant="outline" fullWidth onClick={() => onView(medication)}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

import React from 'react';
import { AlertTriangle, CalendarRange, Clock, MapPin, NotebookPen, Pill, Stethoscope } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { MotherMedication } from '@/types';
import { getMedicationStatusBadgeVariant, getMedicationStatusLabel } from '@/pages/medications/motherMedicationUi';

interface MedicationDetailsModalProps {
  medication: MotherMedication;
  onClose: () => void;
}

export const MedicationDetailsModal: React.FC<MedicationDetailsModalProps> = ({ medication, onClose }) => {
  return (
    <Modal isOpen onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{medication.name}</h2>
            <p className="text-sm text-warm-muted mt-0.5">{medication.dosage} • {medication.frequency}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={getMedicationStatusBadgeVariant(medication.status)} size="sm">
            {getMedicationStatusLabel(medication.status)}
          </Badge>
          {medication.childName && (
            <Badge variant="peach" size="sm">For {medication.childName}</Badge>
          )}
        </div>

        <Card className="bg-warm-ivory border-sandal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Timing</p>
                <p className="text-sm font-semibold text-warm-brown">{medication.timing}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarRange className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Duration</p>
                <p className="text-sm font-semibold text-warm-brown">
                  {formatDate(medication.startDate)}
                  {medication.endDate ? ` – ${formatDate(medication.endDate)}` : ' – Ongoing'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Stethoscope className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Prescribed By</p>
                <p className="text-sm font-semibold text-warm-brown">{medication.doctorName}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Hospital</p>
                <p className="text-sm font-semibold text-warm-brown">{medication.hospitalName}</p>
              </div>
            </div>
          </div>
        </Card>

        {medication.instructions && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">Instructions</p>
            <p className="text-sm text-warm-brown leading-relaxed">{medication.instructions}</p>
          </div>
        )}

        {medication.caution && (
          <div className="flex gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-800">Safety Note</p>
              <p className="text-xs text-rose-800 leading-relaxed mt-0.5">{medication.caution}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-3 rounded-xl bg-peach-verySoft/60 border border-peach-soft">
          <NotebookPen className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
          <p className="text-xs text-sandal-900 leading-relaxed">
            This is a general medication record. Always follow your doctor's guidance and consult them before changing any dosage or stopping a medication.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-sandal-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

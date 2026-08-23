import React from 'react';
import { CalendarClock, MapPin, NotebookPen, Ruler, Scale, Stethoscope, TrendingDown, TrendingUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { GrowthMeasurement } from '@/types';
import { getRecipientIcon, getRecipientLabel } from '@/pages/growth/growthUi';

interface MeasurementDetailsModalProps {
  measurement: GrowthMeasurement;
  previous?: GrowthMeasurement;
  onClose: () => void;
}

export const MeasurementDetailsModal: React.FC<MeasurementDetailsModalProps> = ({
  measurement,
  previous,
  onClose,
}) => {
  const RecipientIcon = getRecipientIcon(measurement.recipientType);
  const weightDelta =
    measurement.weightKg !== undefined && previous?.weightKg !== undefined
      ? Math.round((measurement.weightKg - previous.weightKg) * 100) / 100
      : undefined;

  return (
    <Modal isOpen onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{measurement.context}</h2>
            <p className="text-sm text-warm-muted mt-0.5">{formatDate(measurement.date)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" size="sm">
            {getRecipientLabel(measurement.recipientType)} • {measurement.recipientName}
          </Badge>
          {measurement.loggedByMother && (
            <Badge variant="peach" size="sm">Logged at Home</Badge>
          )}
        </div>

        <Card className="bg-warm-ivory border-sandal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {measurement.weightKg !== undefined && (
              <div className="flex gap-3">
                <Scale className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-warm-muted">Weight</p>
                  <p className="text-sm font-semibold text-warm-brown flex items-center gap-1.5">
                    {measurement.weightKg} kg
                    {weightDelta !== undefined && weightDelta !== 0 && (
                      <span className={weightDelta > 0 ? 'text-sage-text flex items-center gap-0.5 text-xs font-medium' : 'text-rose-600 flex items-center gap-0.5 text-xs font-medium'}>
                        {weightDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {weightDelta > 0 ? '+' : ''}{weightDelta} kg since last visit
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            {measurement.heightCm !== undefined && (
              <div className="flex gap-3">
                <Ruler className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-warm-muted">Height / Length</p>
                  <p className="text-sm font-semibold text-warm-brown">{measurement.heightCm} cm</p>
                </div>
              </div>
            )}
            {measurement.headCircumferenceCm !== undefined && (
              <div className="flex gap-3">
                <RecipientIcon className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-warm-muted">Head Circumference</p>
                  <p className="text-sm font-semibold text-warm-brown">{measurement.headCircumferenceCm} cm</p>
                </div>
              </div>
            )}
            {!measurement.loggedByMother && (
              <div className="flex gap-3">
                <Stethoscope className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-warm-muted">Recorded By</p>
                  <p className="text-sm font-semibold text-warm-brown">{measurement.doctorName}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <CalendarClock className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Date</p>
                <p className="text-sm font-semibold text-warm-brown">{formatDate(measurement.date)}</p>
              </div>
            </div>
            {!measurement.loggedByMother && (
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-warm-muted">Hospital</p>
                  <p className="text-sm font-semibold text-warm-brown">{measurement.hospitalName}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {measurement.notes && (
          <div className="flex gap-3 p-3 rounded-xl bg-peach-verySoft/60 border border-peach-soft">
            <NotebookPen className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sandal-900 leading-relaxed">{measurement.notes}</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-sandal-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

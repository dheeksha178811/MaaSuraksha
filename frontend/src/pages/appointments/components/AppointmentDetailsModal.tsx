import React from 'react';
import { CalendarClock, ClipboardList, MapPin, NotebookPen, Stethoscope } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { MotherAppointment } from '@/types';
import { APPOINTMENT_CATEGORY_LABELS } from '@/data/motherAppointmentsMockData';
import {
  getAppointmentCategoryIcon,
  getMotherAppointmentStatusBadgeVariant,
  getMotherAppointmentStatusLabel,
} from '@/pages/appointments/motherAppointmentUi';

interface AppointmentDetailsModalProps {
  appointment: MotherAppointment;
  onClose: () => void;
  onReschedule?: (appointment: MotherAppointment) => void;
  onCancel?: (appointment: MotherAppointment) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  onClose,
  onReschedule,
  onCancel,
}) => {
  const CategoryIcon = getAppointmentCategoryIcon(appointment.category);

  return (
    <Modal isOpen onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{appointment.title}</h2>
            <p className="text-sm text-warm-muted mt-0.5">{APPOINTMENT_CATEGORY_LABELS[appointment.category]}</p>
          </div>
        </div>

        <Badge variant={getMotherAppointmentStatusBadgeVariant(appointment.status)} size="sm">
          {getMotherAppointmentStatusLabel(appointment.status)}
        </Badge>

        <Card className="bg-warm-ivory border-sandal-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <CalendarClock className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Date & Time</p>
                <p className="text-sm font-semibold text-warm-brown">{formatDate(appointment.date)} • {appointment.time}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Stethoscope className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Doctor</p>
                <p className="text-sm font-semibold text-warm-brown">{appointment.doctorName}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-warm-muted">Hospital</p>
                <p className="text-sm font-semibold text-warm-brown">{appointment.hospitalName}</p>
                <p className="text-xs text-warm-muted">{appointment.location}</p>
              </div>
            </div>
            {appointment.childName && (
              <div className="flex gap-3">
                <ClipboardList className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-warm-muted">For</p>
                  <p className="text-sm font-semibold text-warm-brown">{appointment.childName}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">Reason</p>
          <p className="text-sm text-warm-brown leading-relaxed">{appointment.reason || 'No reason provided.'}</p>
        </div>

        {appointment.notes && (
          <div className="flex gap-3 p-3 rounded-xl bg-peach-verySoft/60 border border-peach-soft">
            <NotebookPen className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sandal-900 leading-relaxed">{appointment.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-sandal-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {onReschedule && (
            <Button variant="secondary" onClick={() => onReschedule(appointment)}>Reschedule</Button>
          )}
          {onCancel && (
            <Button variant="danger" onClick={() => onCancel(appointment)}>Cancel Appointment</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import { CalendarClock, MapPin, Stethoscope } from 'lucide-react';
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

export interface AppointmentCardProps {
  appointment: MotherAppointment;
  onView: (appointment: MotherAppointment) => void;
  onReschedule?: (appointment: MotherAppointment) => void;
  onCancel?: (appointment: MotherAppointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onView,
  onReschedule,
  onCancel,
}) => {
  const CategoryIcon = getAppointmentCategoryIcon(appointment.category);

  return (
    <Card variant="interactive" className="hover:shadow-warm-md">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <CategoryIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{appointment.title}</h4>
            <Badge variant={getMotherAppointmentStatusBadgeVariant(appointment.status)} size="sm">
              {getMotherAppointmentStatusLabel(appointment.status)}
            </Badge>
            <Badge variant="outline" size="sm">
              {APPOINTMENT_CATEGORY_LABELS[appointment.category]}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-sandal-500" />
              {formatDate(appointment.date)} • {appointment.time}
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-sandal-500" />
              {appointment.doctorName}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sandal-500" />
              {appointment.hospitalName}
            </span>
          </div>

          {appointment.reason && (
            <p className="text-xs text-warm-muted leading-relaxed line-clamp-2">{appointment.reason}</p>
          )}
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0 sm:w-36 w-full">
          <Button size="sm" variant="outline" fullWidth onClick={() => onView(appointment)}>
            View Details
          </Button>
          {onReschedule && (
            <Button size="sm" variant="ghost" fullWidth onClick={() => onReschedule(appointment)}>
              Reschedule
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="ghost" fullWidth className="text-rose-700 hover:bg-rose-50" onClick={() => onCancel(appointment)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

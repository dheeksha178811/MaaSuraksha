import {
  Baby,
  CalendarCheck,
  FlaskConical,
  HeartPulse,
  ScanLine,
  Syringe,
  LucideIcon,
} from 'lucide-react';
import { AppointmentCategory, MotherAppointmentStatus } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getMotherAppointmentStatusBadgeVariant = (status: MotherAppointmentStatus): BadgeVariant => {
  switch (status) {
    case 'upcoming':
      return 'sandal';
    case 'requested':
      return 'peach';
    case 'completed':
      return 'sage';
    case 'cancelled':
      return 'danger';
    case 'rescheduled':
      return 'warm';
    default:
      return 'outline';
  }
};

export const getMotherAppointmentStatusLabel = (status: MotherAppointmentStatus): string => {
  switch (status) {
    case 'upcoming':
      return 'Confirmed';
    case 'requested':
      return 'Requested';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'rescheduled':
      return 'Rescheduled';
    default:
      return status;
  }
};

export const getAppointmentCategoryIcon = (category: AppointmentCategory): LucideIcon => {
  switch (category) {
    case 'ANTENATAL_CHECKUP':
      return HeartPulse;
    case 'ULTRASOUND_SCAN':
      return ScanLine;
    case 'LAB_TEST':
      return FlaskConical;
    case 'POSTNATAL_CHECKUP':
      return CalendarCheck;
    case 'PEDIATRIC_CHECKUP':
      return Baby;
    case 'VACCINATION':
      return Syringe;
    default:
      return CalendarCheck;
  }
};

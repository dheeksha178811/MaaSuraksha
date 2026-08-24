import {
  CalendarClock,
  ClipboardList,
  Heart,
  Landmark,
  LucideIcon,
  Pill,
  Syringe,
} from 'lucide-react';
import { NotificationType } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getNotificationIcon = (type: NotificationType): LucideIcon => {
  switch (type) {
    case 'vaccination_reminder':
      return Syringe;
    case 'appointment_reminder':
      return CalendarClock;
    case 'medication_reminder':
      return Pill;
    case 'care_plan_update':
      return ClipboardList;
    case 'scheme_update':
      return Landmark;
    case 'health_tip':
    default:
      return Heart;
  }
};

export const getNotificationBadgeVariant = (type: NotificationType): BadgeVariant => {
  switch (type) {
    case 'vaccination_reminder':
      return 'sandal';
    case 'appointment_reminder':
      return 'peach';
    case 'medication_reminder':
      return 'sage';
    case 'care_plan_update':
      return 'warm';
    case 'scheme_update':
      return 'sandal';
    case 'health_tip':
    default:
      return 'outline';
  }
};

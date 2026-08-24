import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  FileText,
  LucideIcon,
  MessageCircle,
  Upload,
} from 'lucide-react';
import { DoctorNotificationType } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const DOCTOR_NOTIFICATION_TYPE_LABELS: Record<DoctorNotificationType, string> = {
  MESSAGE: 'Message',
  APPOINTMENT_SCHEDULED: 'Appointment',
  APPOINTMENT_RESCHEDULED: 'Appointment',
  REPORT_SUBMITTED: 'Report',
  CARE_PLAN_UPDATE: 'Care Plan',
  FOLLOW_UP_DUE: 'Follow-up',
  URGENT_ALERT: 'Urgent',
  DOCUMENT_UPLOADED: 'Document',
};

export const DOCTOR_NOTIFICATION_ACTION_LABELS: Record<DoctorNotificationType, string> = {
  MESSAGE: 'Open Conversation',
  APPOINTMENT_SCHEDULED: 'View Appointment',
  APPOINTMENT_RESCHEDULED: 'View Appointment',
  REPORT_SUBMITTED: 'Review Report',
  CARE_PLAN_UPDATE: 'View Care Plan',
  FOLLOW_UP_DUE: 'View Patient',
  URGENT_ALERT: 'Review Patient',
  DOCUMENT_UPLOADED: 'View Patient',
};

export const getDoctorNotificationIcon = (type: DoctorNotificationType): LucideIcon => {
  switch (type) {
    case 'MESSAGE':
      return MessageCircle;
    case 'APPOINTMENT_SCHEDULED':
      return CalendarCheck;
    case 'APPOINTMENT_RESCHEDULED':
      return CalendarClock;
    case 'REPORT_SUBMITTED':
      return FileText;
    case 'CARE_PLAN_UPDATE':
      return ClipboardList;
    case 'FOLLOW_UP_DUE':
      return CalendarClock;
    case 'URGENT_ALERT':
      return AlertTriangle;
    case 'DOCUMENT_UPLOADED':
      return Upload;
    default:
      return MessageCircle;
  }
};

export const getDoctorNotificationBadgeVariant = (type: DoctorNotificationType): BadgeVariant => {
  switch (type) {
    case 'MESSAGE':
      return 'sandal';
    case 'APPOINTMENT_SCHEDULED':
    case 'APPOINTMENT_RESCHEDULED':
      return 'peach';
    case 'REPORT_SUBMITTED':
    case 'DOCUMENT_UPLOADED':
      return 'sage';
    case 'CARE_PLAN_UPDATE':
      return 'warm';
    case 'FOLLOW_UP_DUE':
      return 'sandal';
    case 'URGENT_ALERT':
      return 'danger';
    default:
      return 'outline';
  }
};

export type DoctorNotificationFilter =
  | 'ALL'
  | 'UNREAD'
  | 'MESSAGE'
  | 'APPOINTMENT'
  | 'REPORT'
  | 'CARE_PLAN'
  | 'URGENT';

export const DOCTOR_NOTIFICATION_FILTER_TYPES: Record<
  Exclude<DoctorNotificationFilter, 'ALL' | 'UNREAD' | 'URGENT'>,
  DoctorNotificationType[]
> = {
  MESSAGE: ['MESSAGE'],
  APPOINTMENT: ['APPOINTMENT_SCHEDULED', 'APPOINTMENT_RESCHEDULED', 'FOLLOW_UP_DUE'],
  REPORT: ['REPORT_SUBMITTED', 'DOCUMENT_UPLOADED'],
  CARE_PLAN: ['CARE_PLAN_UPDATE'],
};

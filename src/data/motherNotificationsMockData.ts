import { mockNotifications } from '@/data/mockData';
import { NotificationItem, NotificationType } from '@/types';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  vaccination_reminder: 'Vaccination',
  appointment_reminder: 'Appointment',
  medication_reminder: 'Medication',
  care_plan_update: 'Care Plan',
  health_tip: 'Health Tip',
  scheme_update: 'Scheme Update',
};

/**
 * Notifications are already scoped to the single mock mother in this
 * demo (`mockNotifications` carries `motherId`), but this getter keeps the
 * same shape as the other Mother-side modules so it can be swapped for a
 * real per-mother query once a backend exists.
 */
export const getNotificationsForMother = (motherId: string): NotificationItem[] =>
  mockNotifications
    .filter((n) => n.motherId === motherId)
    .slice()
    .sort((a, b) => Number(a.isRead) - Number(b.isRead));

export const getUnreadCountForMother = (motherId: string): number =>
  getNotificationsForMother(motherId).filter((n) => !n.isRead).length;

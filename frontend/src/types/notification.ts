export type NotificationType =
  | 'vaccination_reminder'
  | 'appointment_reminder'
  | 'medication_reminder'
  | 'care_plan_update'
  | 'health_tip'
  | 'scheme_update';

export interface NotificationItem {
  id: string;
  motherId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

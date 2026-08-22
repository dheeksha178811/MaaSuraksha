export type NotificationType = 'vaccination_reminder' | 'appointment_reminder' | 'health_tip' | 'scheme_update';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

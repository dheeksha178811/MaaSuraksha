// ---------------------------------------------------------------------------
// Doctor-side "Clinical Notifications" module.
// Notifications reference existing `AssignedPatient` records via patientId
// (no patient identity duplicated) and existing Doctor routes via actionUrl.
// Carries its own stable id so this can migrate directly to a
// `doctorNotifications` collection in MongoDB later.
// ---------------------------------------------------------------------------

export type DoctorNotificationType =
  | 'MESSAGE'
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'REPORT_SUBMITTED'
  | 'CARE_PLAN_UPDATE'
  | 'FOLLOW_UP_DUE'
  | 'URGENT_ALERT'
  | 'DOCUMENT_UPLOADED';

export type DoctorNotificationPriority = 'normal' | 'urgent';

export interface DoctorNotification {
  id: string;
  doctorId: string;
  patientId?: string;
  patientName?: string;
  type: DoctorNotificationType;
  title: string;
  description: string;
  timestamp: string; // ISO datetime
  isRead: boolean;
  priority: DoctorNotificationPriority;
  actionUrl?: string;
}

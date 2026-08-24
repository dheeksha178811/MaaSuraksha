import { mockDoctor } from '@/data/mockData';
import { DoctorNotification } from '@/types';

/**
 * Fixed "now" reference for this mock dataset, matching DOCTOR_TODAY_ISO in
 * doctorPatientsMockData.ts and DOCTOR_MESSAGES_NOW_ISO in
 * doctorMessagesMockData.ts.
 */
export const DOCTOR_NOTIFICATIONS_NOW_ISO = '2026-08-23T09:15:00';

/**
 * Notifications cross-reference the SAME patientId/report/care-plan records
 * used elsewhere in the doctor-side mock data (doctorPatientsMockData.ts,
 * doctorMessagesMockData.ts) rather than duplicating those records.
 */
export const doctorNotifications: DoctorNotification[] = [
  {
    id: 'dnotif_01',
    doctorId: mockDoctor.id,
    patientId: 'pat_01',
    patientName: 'Ananya Kapoor',
    type: 'MESSAGE',
    title: 'New message from Ananya Kapoor',
    description: 'Patient Ananya Kapoor sent a new message regarding her postpartum recovery.',
    timestamp: '2026-08-23T08:10:00',
    isRead: false,
    priority: 'normal',
    actionUrl: '/doctor/messages?conversation=conv_01',
  },
  {
    id: 'dnotif_02',
    doctorId: mockDoctor.id,
    patientId: 'pat_04',
    patientName: 'Kavya Reddy',
    type: 'URGENT_ALERT',
    title: 'Urgent patient alert',
    description: 'Kavya Reddy has reported symptoms requiring clinical review (headache, blurred vision).',
    timestamp: '2026-08-23T07:50:00',
    isRead: false,
    priority: 'urgent',
    actionUrl: '/doctor/patients/pat_04',
  },
  {
    id: 'dnotif_03',
    doctorId: mockDoctor.id,
    patientId: 'pat_07',
    patientName: 'Ritika Verma',
    type: 'REPORT_SUBMITTED',
    title: 'Postpartum report uploaded',
    description: 'New CBC report is available for review.',
    timestamp: '2026-08-22T16:30:00',
    isRead: false,
    priority: 'normal',
    actionUrl: '/doctor/reports',
  },
  {
    id: 'dnotif_04',
    doctorId: mockDoctor.id,
    patientId: 'pat_07',
    patientName: 'Ritika Verma',
    type: 'FOLLOW_UP_DUE',
    title: 'Follow-up due for Ritika Verma',
    description: 'Iron supplementation follow-up was due August 20 and is now overdue.',
    timestamp: '2026-08-21T09:00:00',
    isRead: false,
    priority: 'normal',
    actionUrl: '/doctor/patients/pat_07',
  },
  {
    id: 'dnotif_05',
    doctorId: mockDoctor.id,
    patientId: 'pat_02',
    patientName: 'Meera Iyer',
    type: 'CARE_PLAN_UPDATE',
    title: 'Care plan updated for Meera Iyer',
    description: 'The gestational diabetes diet control plan was reviewed and confirmed active.',
    timestamp: '2026-08-20T14:10:00',
    isRead: true,
    priority: 'normal',
    actionUrl: '/doctor/care-plans',
  },
  {
    id: 'dnotif_06',
    doctorId: mockDoctor.id,
    patientId: 'pat_04',
    patientName: 'Kavya Reddy',
    type: 'DOCUMENT_UPLOADED',
    title: 'Document uploaded for Kavya Reddy',
    description: 'BP & Urine Protein Test (36 Weeks) was uploaded ahead of the pre-eclampsia review.',
    timestamp: '2026-08-20T11:05:00',
    isRead: true,
    priority: 'normal',
    actionUrl: '/doctor/patients/pat_04',
  },
  {
    id: 'dnotif_07',
    doctorId: mockDoctor.id,
    patientId: 'pat_08',
    patientName: 'Pooja Nayar',
    type: 'APPOINTMENT_SCHEDULED',
    title: 'Appointment scheduled with Pooja Nayar',
    description: 'A registration visit has been scheduled for August 24 at 11:00 AM.',
    timestamp: '2026-08-19T10:00:00',
    isRead: true,
    priority: 'normal',
    actionUrl: '/doctor/appointments',
  },
  {
    id: 'dnotif_08',
    doctorId: mockDoctor.id,
    patientId: 'pat_03',
    patientName: 'Fatima Sheikh',
    type: 'APPOINTMENT_RESCHEDULED',
    title: 'Appointment rescheduled for Fatima Sheikh',
    description: 'The antenatal check-up was rescheduled to August 27 at 4:00 PM.',
    timestamp: '2026-08-18T15:45:00',
    isRead: true,
    priority: 'normal',
    actionUrl: '/doctor/appointments',
  },
];

export const getNotificationsForDoctor = (doctorId: string): DoctorNotification[] =>
  doctorNotifications
    .filter((n) => n.doctorId === doctorId)
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

export const getUnreadNotificationCountForDoctor = (doctorId: string): number =>
  getNotificationsForDoctor(doctorId).filter((n) => !n.isRead).length;

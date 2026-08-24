import { mockDoctor } from '@/data/mockData';
import {
  DefaultAppointmentView,
  DefaultNotificationFilter,
  DefaultPatientListView,
  DoctorSettings,
  PreferredCommunicationMethod,
} from '@/types';

/**
 * Default preference set for Dr. Priya Menon, reusing the same doctorId as
 * the core `mockDoctor` record so this can later be joined directly against
 * a real `doctorSettings` collection. There is no backend yet, so the
 * Settings page reads this once as the seed for local component state.
 */
export const defaultDoctorSettings: DoctorSettings = {
  doctorId: mockDoctor.id,
  notifications: {
    inApp: true,
    appointmentReminders: true,
    patientMessages: true,
    reportSubmissions: true,
    carePlanUpdates: false,
    urgentAlerts: true,
  },
  communication: {
    preferredMethod: 'IN_APP',
    allowPatientInitiatedMessages: true,
    allowVideoConsultationRequests: true,
  },
  workspace: {
    defaultPatientList: 'ALL',
    defaultNotificationFilter: 'ALL',
    defaultAppointmentView: 'LIST',
  },
  availability: {
    consultationModes: { inPerson: true, video: true, phone: true },
    availableDays: [...mockDoctor.availableDays],
  },
  privacy: {
    twoFactorEnabled: false,
    shareAnonymizedUsageData: true,
  },
};

export const getDoctorSettings = (doctorId: string): DoctorSettings =>
  defaultDoctorSettings.doctorId === doctorId
    ? {
        ...defaultDoctorSettings,
        notifications: { ...defaultDoctorSettings.notifications },
        communication: { ...defaultDoctorSettings.communication },
        workspace: { ...defaultDoctorSettings.workspace },
        availability: {
          consultationModes: { ...defaultDoctorSettings.availability.consultationModes },
          availableDays: [...defaultDoctorSettings.availability.availableDays],
        },
        privacy: { ...defaultDoctorSettings.privacy },
      }
    : { ...defaultDoctorSettings, doctorId };

/**
 * Applies a partial update to a `DoctorSettings` record. Frontend-only for
 * now — the caller holds the result in local state — but shaped like a PATCH
 * so a real `updateDoctorSettings` API call can replace this without any UI
 * changes.
 */
export const updateDoctorSettings = (current: DoctorSettings, patch: Partial<DoctorSettings>): DoctorSettings => ({
  ...current,
  ...patch,
});

export const WEEK_DAYS: string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const PREFERRED_COMMUNICATION_OPTIONS: { value: PreferredCommunicationMethod; label: string }[] = [
  { value: 'IN_APP', label: 'In-App' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
];

export const DEFAULT_PATIENT_LIST_OPTIONS: { value: DefaultPatientListView; label: string }[] = [
  { value: 'ALL', label: 'All Assigned Patients' },
  { value: 'FOLLOW_UP_DUE', label: 'Follow-up Due' },
  { value: 'HIGH_RISK', label: 'High Risk' },
  { value: 'TODAYS_APPOINTMENTS', label: "Today's Appointments" },
];

export const DEFAULT_NOTIFICATION_FILTER_OPTIONS: { value: DefaultNotificationFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'URGENT', label: 'Urgent' },
];

export const DEFAULT_APPOINTMENT_VIEW_OPTIONS: { value: DefaultAppointmentView; label: string }[] = [
  { value: 'LIST', label: 'List' },
  { value: 'CALENDAR', label: 'Calendar' },
];

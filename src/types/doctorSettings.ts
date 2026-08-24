// ---------------------------------------------------------------------------
// Doctor-side "Account & Clinical Settings" module.
// Preferences are kept separate from the core `DoctorProfile` type (used
// across the rest of the Doctor portal) so that is left untouched. Everything
// here carries a stable doctorId so it can migrate directly to a
// `doctorSettings` collection in MongoDB later — today it only ever lives in
// local React state seeded from these mock defaults.
// ---------------------------------------------------------------------------

export interface DoctorNotificationPreferences {
  inApp: boolean;
  appointmentReminders: boolean;
  patientMessages: boolean;
  reportSubmissions: boolean;
  carePlanUpdates: boolean;
  urgentAlerts: boolean;
}

export type PreferredCommunicationMethod = 'IN_APP' | 'EMAIL' | 'SMS';

export interface DoctorCommunicationPreferences {
  preferredMethod: PreferredCommunicationMethod;
  allowPatientInitiatedMessages: boolean;
  allowVideoConsultationRequests: boolean;
}

export type DefaultPatientListView = 'ALL' | 'FOLLOW_UP_DUE' | 'HIGH_RISK' | 'TODAYS_APPOINTMENTS';
export type DefaultNotificationFilter = 'ALL' | 'UNREAD' | 'URGENT';
export type DefaultAppointmentView = 'LIST' | 'CALENDAR';

export interface DoctorWorkspacePreferences {
  defaultPatientList: DefaultPatientListView;
  defaultNotificationFilter: DefaultNotificationFilter;
  defaultAppointmentView: DefaultAppointmentView;
}

export interface DoctorConsultationModes {
  inPerson: boolean;
  video: boolean;
  phone: boolean;
}

export interface DoctorAvailabilityPreferences {
  consultationModes: DoctorConsultationModes;
  availableDays: string[];
}

export interface DoctorPrivacySecurityPreferences {
  twoFactorEnabled: boolean;
  shareAnonymizedUsageData: boolean;
}

export interface DoctorSettings {
  doctorId: string;
  notifications: DoctorNotificationPreferences;
  communication: DoctorCommunicationPreferences;
  workspace: DoctorWorkspacePreferences;
  availability: DoctorAvailabilityPreferences;
  privacy: DoctorPrivacySecurityPreferences;
}

export interface DoctorProfileFormValues {
  phone: string;
  email: string;
  location: string;
  bio: string;
}

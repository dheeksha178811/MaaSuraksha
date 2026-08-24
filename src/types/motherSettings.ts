// ---------------------------------------------------------------------------
// Mother-side "Account & Care Settings" module.
// Preferences are kept separate from the core `MotherProfile` type (used
// across the rest of the app) so that is left untouched. Everything here
// carries a stable motherId so it can migrate directly to a `motherSettings`
// collection in MongoDB later — today it only ever lives in local React
// state seeded from these mock defaults.
// ---------------------------------------------------------------------------

export type SettingsLanguage = 'en' | 'hi' | 'kn' | 'ml';

export interface NotificationPreferences {
  app: boolean;
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
}

export interface ReminderPreferences {
  medication: boolean;
  appointment: boolean;
  vaccination: boolean;
  followUp: boolean;
  general: boolean;
  defaultReminderTime: string; // 24-hour "HH:mm", e.g. "09:00"
}

export interface PrivacyPreferences {
  careTeamDataSharing: boolean;
  emergencyInfoAccess: boolean;
  personalizedCareInsights: boolean;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface MotherSettings {
  motherId: string;
  language: SettingsLanguage;
  notifications: NotificationPreferences;
  reminders: ReminderPreferences;
  privacy: PrivacyPreferences;
}

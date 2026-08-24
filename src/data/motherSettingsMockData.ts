import { mockMother } from '@/data/mockData';
import { MotherSettings, SettingsLanguage } from '@/types';

/**
 * Default preference set for Ananya Kapoor, reusing the same motherId as
 * the core `mockMother` record so this can later be joined directly against
 * a real `motherSettings` collection. There is no backend yet, so pages read
 * this once as the seed for local component state.
 */
export const defaultMotherSettings: MotherSettings = {
  motherId: mockMother.id,
  language: 'en',
  notifications: {
    app: true,
    sms: true,
    whatsapp: false,
    email: true,
  },
  reminders: {
    medication: true,
    appointment: true,
    vaccination: true,
    followUp: true,
    general: false,
    defaultReminderTime: '09:00',
  },
  privacy: {
    careTeamDataSharing: true,
    emergencyInfoAccess: true,
    personalizedCareInsights: false,
  },
};

export const getSettingsForMother = (motherId: string): MotherSettings =>
  defaultMotherSettings.motherId === motherId
    ? defaultMotherSettings
    : { ...defaultMotherSettings, motherId };

export const LANGUAGE_OPTIONS: { value: SettingsLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'ml', label: 'Malayalam (മലയാളം)' },
];

import React, { useState } from 'react';
import {
  AlarmClock,
  AlertTriangle,
  Bell,
  HeartPulse,
  Languages,
  Laptop,
  Lock,
  Mail,
  MapPin,
  Phone,
  Smartphone,
  UserCircle,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { mockMother } from '@/data/mockData';
import { getSettingsForMother, LANGUAGE_OPTIONS } from '@/data/motherSettingsMockData';
import {
  EmergencyContact,
  NotificationPreferences,
  PrivacyPreferences,
  ReminderPreferences,
  SettingsLanguage,
} from '@/types';
import { SettingToggleRow } from './components/SettingToggleRow';
import { EditProfileModal, ProfileFormValues } from './components/EditProfileModal';
import { EditEmergencyContactModal } from './components/EditEmergencyContactModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ConfirmDialog } from './components/ConfirmDialog';

const MOCK_SESSIONS = [
  { id: 'session_01', label: 'This Device', detail: 'Chrome on Windows • Active now', icon: Laptop },
  { id: 'session_02', label: 'MaaSuraksha App', detail: 'iPhone 14 • Last active 2 days ago', icon: Smartphone },
];

type ToastState = { type: 'success' | 'info'; title: string; message?: string } | null;

export const MotherSettingsPage: React.FC = () => {
  const seedSettings = getSettingsForMother(mockMother.id);

  const [profile, setProfile] = useState<ProfileFormValues>({
    name: mockMother.name,
    phone: mockMother.phone || '',
    email: mockMother.email,
    location: mockMother.location,
  });
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({ ...mockMother.emergencyContact });
  const [notifications, setNotifications] = useState<NotificationPreferences>(seedSettings.notifications);
  const [reminders, setReminders] = useState<ReminderPreferences>(seedSettings.reminders);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(seedSettings.privacy);
  const [language, setLanguage] = useState<SettingsLanguage>(seedSettings.language);

  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [isEditEmergencyOpen, setEditEmergencyOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isSignOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [isDeactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const showToast = (state: ToastState) => {
    setToast(state);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = (values: ProfileFormValues) => {
    setProfile(values);
    setEditProfileOpen(false);
    showToast({ type: 'success', title: 'Profile updated successfully.' });
  };

  const handleSaveEmergencyContact = (values: EmergencyContact) => {
    setEmergencyContact(values);
    setEditEmergencyOpen(false);
    showToast({ type: 'success', title: 'Emergency contact updated.' });
  };

  const handleNotificationChange = (key: keyof NotificationPreferences) => (checked: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: checked }));
    showToast({ type: 'success', title: 'Notification preferences saved.' });
  };

  const handleReminderToggleChange = (key: Exclude<keyof ReminderPreferences, 'defaultReminderTime'>) => (checked: boolean) => {
    setReminders((prev) => ({ ...prev, [key]: checked }));
    showToast({ type: 'success', title: 'Reminder preferences updated.' });
  };

  const handleReminderTimeChange = (value: string) => {
    setReminders((prev) => ({ ...prev, defaultReminderTime: value }));
    showToast({ type: 'success', title: 'Reminder preferences updated.' });
  };

  const handlePrivacyChange = (key: keyof PrivacyPreferences) => (checked: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: checked }));
    showToast({ type: 'success', title: 'Privacy preferences updated.' });
  };

  const handleLanguageChange = (value: SettingsLanguage) => {
    setLanguage(value);
    const label = LANGUAGE_OPTIONS.find((o) => o.value === value)?.label;
    showToast({ type: 'success', title: 'Language preference updated.', message: label ? `App language set to ${label}.` : undefined });
  };

  const handlePasswordChanged = () => {
    showToast({ type: 'success', title: 'Password updated (demo only).', message: 'No real credentials were changed.' });
  };

  const handleConfirmSignOut = () => {
    setSignOutConfirmOpen(false);
    showToast({ type: 'success', title: 'Signed out of all other devices.', message: 'This is a demo action — your session here is unaffected.' });
  };

  const handleConfirmDeactivate = () => {
    setDeactivateConfirmOpen(false);
    showToast({ type: 'info', title: 'This is a demo action.', message: 'Your account was not deactivated — no data was changed.' });
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    showToast({ type: 'info', title: 'This is a demo action.', message: 'Your account was not deleted — no data was changed.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account & Care Settings"
        subtitle="Manage your account, reminders, communication preferences, privacy, and care preferences."
        badge={<Badge variant="sandal">Mother Account</Badge>}
      />

      {/* Profile & Account */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100 flex-wrap">
          <div className="flex items-center gap-2.5">
            <UserCircle className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-xl font-bold text-warm-brown">Profile & Account</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(true)}>Edit Profile</Button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <UserCircle className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Name</dt>
              <dd className="font-medium text-warm-brown">{profile.name}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Role</dt>
              <dd className="font-medium text-warm-brown capitalize">{mockMother.role} / Beneficiary</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Phone Number</dt>
              <dd className="font-medium text-warm-brown">{profile.phone || '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Email</dt>
              <dd className="font-medium text-warm-brown">{profile.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Location</dt>
              <dd className="font-medium text-warm-brown">{profile.location}</dd>
            </div>
          </div>
        </dl>
      </Card>

      {/* Notification Preferences */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <Bell className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Notification Preferences</h3>
        </div>
        <SettingToggleRow
          title="App Notifications"
          description="Receive reminders and important care updates in MaaSuraksha."
          checked={notifications.app}
          onChange={handleNotificationChange('app')}
        />
        <SettingToggleRow
          title="SMS"
          description="Receive important appointment and care reminders by SMS."
          checked={notifications.sms}
          onChange={handleNotificationChange('sms')}
        />
        <SettingToggleRow
          title="WhatsApp"
          description="Receive selected reminders and care updates on WhatsApp."
          checked={notifications.whatsapp}
          onChange={handleNotificationChange('whatsapp')}
        />
        <SettingToggleRow
          title="Email"
          description="Receive reports, summaries, and important account updates by email."
          checked={notifications.email}
          onChange={handleNotificationChange('email')}
        />
      </Card>

      {/* Reminder Preferences */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <AlarmClock className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Reminder Preferences</h3>
        </div>
        <SettingToggleRow
          title="Medication reminders"
          description="Reminders for Iron & Folic Acid, prenatal vitamins, and other prescribed medication."
          checked={reminders.medication}
          onChange={handleReminderToggleChange('medication')}
        />
        <SettingToggleRow
          title="Appointment reminders"
          description="Reminders ahead of antenatal, postnatal, and pediatric consultations."
          checked={reminders.appointment}
          onChange={handleReminderToggleChange('appointment')}
        />
        <SettingToggleRow
          title="Vaccination reminders"
          description="Reminders for upcoming and due immunizations for your child."
          checked={reminders.vaccination}
          onChange={handleReminderToggleChange('vaccination')}
        />
        <SettingToggleRow
          title="Follow-up reminders"
          description="Reminders for lab reviews and doctor-recommended follow-up visits."
          checked={reminders.followUp}
          onChange={handleReminderToggleChange('followUp')}
        />
        <SettingToggleRow
          title="General care reminders"
          description="Gentle nudges for nutrition, hydration, and postpartum wellness tips."
          checked={reminders.general}
          onChange={handleReminderToggleChange('general')}
        />
        <div className="pt-4">
          <div className="max-w-xs">
            <Input
              label="Default reminder time"
              type="time"
              value={reminders.defaultReminderTime}
              onChange={(e) => handleReminderTimeChange(e.target.value)}
              helperText="Reminders without a specific schedule will be sent around this time."
            />
          </div>
        </div>
      </Card>

      {/* Language & Communication */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Languages className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Language & Communication</h3>
        </div>
        <div className="max-w-xs">
          <Select
            label="Preferred Language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SettingsLanguage)}
            options={LANGUAGE_OPTIONS}
            helperText="This changes only your saved preference — MaaSuraksha is not yet translated."
          />
        </div>
      </Card>

      {/* Privacy & Data Sharing */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <ShieldCheck className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Privacy & Data Sharing</h3>
        </div>
        <SettingToggleRow
          title="Care Team Data Sharing"
          description="Allow your assigned doctor and hospital care team to view your relevant health information."
          checked={privacy.careTeamDataSharing}
          onChange={handlePrivacyChange('careTeamDataSharing')}
        />
        <SettingToggleRow
          title="Emergency Information Access"
          description="Allow authorized emergency personnel to access the limited emergency information on your care profile."
          checked={privacy.emergencyInfoAccess}
          onChange={handlePrivacyChange('emergencyInfoAccess')}
        />
        <SettingToggleRow
          title="Personalized Care Insights"
          description="Use your care data to personalize reminders and care suggestions for you."
          checked={privacy.personalizedCareInsights}
          onChange={handlePrivacyChange('personalizedCareInsights')}
        />
      </Card>

      {/* Emergency Contact */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100 flex-wrap">
          <div className="flex items-center gap-2.5">
            <HeartPulse className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-xl font-bold text-warm-brown">Emergency Contact</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditEmergencyOpen(true)}>Edit Contact</Button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-warm-muted">Contact Name</dt>
            <dd className="font-medium text-warm-brown">{emergencyContact.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Relationship</dt>
            <dd className="font-medium text-warm-brown">{emergencyContact.relation}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Phone Number</dt>
            <dd className="font-medium text-warm-brown">{emergencyContact.phone}</dd>
          </div>
        </dl>
      </Card>

      {/* Security */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Lock className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Security</h3>
        </div>

        <div className="flex items-center justify-between gap-4 py-3 border-b border-sandal-100/70">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warm-brown">Change Password</p>
            <p className="text-xs text-warm-muted mt-0.5">Update the password used to sign in to MaaSuraksha.</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setChangePasswordOpen(true)}>
            Change Password
          </Button>
        </div>

        <div className="py-3 border-b border-sandal-100/70 space-y-2.5">
          <p className="text-sm font-semibold text-warm-brown">Active Sessions / Devices</p>
          {MOCK_SESSIONS.map((session) => (
            <div key={session.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-warm-ivory border border-sandal-100">
              <div className="w-8 h-8 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
                <session.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-warm-brown">{session.label}</p>
                <p className="text-[11px] text-warm-muted">{session.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 pt-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warm-brown">Sign Out of All Devices</p>
            <p className="text-xs text-warm-muted mt-0.5">End your session on every device, including this one.</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setSignOutConfirmOpen(true)}>
            Sign Out All
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="space-y-4 border-rose-200/70">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Danger Zone</h3>
        </div>
        <p className="text-xs text-warm-muted">
          These actions are demo interactions only in this preview build — no account or application data is changed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-warm-ivory border border-sandal-100 flex flex-col gap-2.5">
            <div>
              <p className="text-sm font-semibold text-warm-brown">Deactivate Account</p>
              <p className="text-xs text-warm-muted mt-0.5">Temporarily hide your profile. You can reactivate anytime.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDeactivateConfirmOpen(true)}>Deactivate Account</Button>
          </div>
          <div className="p-3.5 rounded-xl bg-warm-ivory border border-sandal-100 flex flex-col gap-2.5">
            <div>
              <p className="text-sm font-semibold text-warm-brown">Delete Account</p>
              <p className="text-xs text-warm-muted mt-0.5">Permanently remove your account and care records.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>Delete Account</Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        initialValues={profile}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <EditEmergencyContactModal
        isOpen={isEditEmergencyOpen}
        initialValues={emergencyContact}
        onClose={() => setEditEmergencyOpen(false)}
        onSave={handleSaveEmergencyContact}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSaved={handlePasswordChanged}
      />

      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        title="Sign Out of All Devices?"
        description="This will end your MaaSuraksha session on every signed-in device, including this one."
        confirmLabel="Sign Out All"
        onConfirm={handleConfirmSignOut}
        onClose={() => setSignOutConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeactivateConfirmOpen}
        title="Deactivate Account?"
        description="This is currently a demo action — your account will not actually be deactivated and no data will change."
        confirmLabel="Deactivate"
        tone="danger"
        onConfirm={handleConfirmDeactivate}
        onClose={() => setDeactivateConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Account?"
        description="This is currently a demo action — your account and care records will not actually be deleted."
        confirmLabel="Delete Account"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

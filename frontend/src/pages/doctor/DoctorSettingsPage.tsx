import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  GraduationCap,
  Laptop,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  Stethoscope,
  UserCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';
import { mockDoctor } from '@/data/mockData';
import { useMockAuth } from '@/hooks/useMockAuth';
import {
  DEFAULT_APPOINTMENT_VIEW_OPTIONS,
  DEFAULT_NOTIFICATION_FILTER_OPTIONS,
  DEFAULT_PATIENT_LIST_OPTIONS,
  PREFERRED_COMMUNICATION_OPTIONS,
  WEEK_DAYS,
  getDoctorSettings,
  updateDoctorSettings,
} from '@/data/doctorSettingsMockData';
import {
  DefaultAppointmentView,
  DefaultNotificationFilter,
  DefaultPatientListView,
  DoctorProfileFormValues,
  DoctorSettings,
  PreferredCommunicationMethod,
} from '@/types';
import { SettingToggleRow } from '@/pages/settings/components/SettingToggleRow';
import { ConfirmDialog } from '@/pages/settings/components/ConfirmDialog';
import { ChangePasswordModal } from '@/pages/settings/components/ChangePasswordModal';
import { EditDoctorProfileModal } from '@/pages/doctor/components/EditDoctorProfileModal';

const INITIAL_PROFILE: DoctorProfileFormValues = {
  phone: mockDoctor.phone || '+91 98450 12345',
  email: mockDoctor.email,
  location: mockDoctor.location || '',
  bio: 'Specializing in high-risk pregnancy management and postpartum recovery care.',
};

type ToastState = { type: 'success' | 'info'; title: string; message?: string } | null;

export const DoctorSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useMockAuth();
  const doctorId = mockDoctor.id;

  const [profile, setProfile] = useState<DoctorProfileFormValues>(INITIAL_PROFILE);
  const [settings, setSettings] = useState<DoctorSettings>(() => getDoctorSettings(doctorId));

  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const showToast = (state: ToastState) => {
    setToast(state);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = (values: DoctorProfileFormValues) => {
    setProfile(values);
    setEditProfileOpen(false);
    showToast({ type: 'success', title: 'Profile updated successfully.' });
  };

  const handleNotificationChange = (key: keyof DoctorSettings['notifications']) => (checked: boolean) => {
    setSettings((prev) =>
      updateDoctorSettings(prev, { notifications: { ...prev.notifications, [key]: checked } })
    );
  };

  const handlePreferredMethodChange = (value: PreferredCommunicationMethod) => {
    setSettings((prev) => updateDoctorSettings(prev, { communication: { ...prev.communication, preferredMethod: value } }));
  };

  const handleCommunicationToggle = (key: 'allowPatientInitiatedMessages' | 'allowVideoConsultationRequests') => (
    checked: boolean
  ) => {
    setSettings((prev) => updateDoctorSettings(prev, { communication: { ...prev.communication, [key]: checked } }));
  };

  const handleWorkspaceChange = <K extends keyof DoctorSettings['workspace']>(key: K, value: DoctorSettings['workspace'][K]) => {
    setSettings((prev) => updateDoctorSettings(prev, { workspace: { ...prev.workspace, [key]: value } }));
  };

  const handleConsultationModeToggle = (key: keyof DoctorSettings['availability']['consultationModes']) => (
    checked: boolean
  ) => {
    setSettings((prev) =>
      updateDoctorSettings(prev, {
        availability: {
          ...prev.availability,
          consultationModes: { ...prev.availability.consultationModes, [key]: checked },
        },
      })
    );
  };

  const handleToggleAvailableDay = (day: string) => {
    setSettings((prev) => {
      const isActive = prev.availability.availableDays.includes(day);
      const availableDays = isActive
        ? prev.availability.availableDays.filter((d) => d !== day)
        : [...prev.availability.availableDays, day];
      return updateDoctorSettings(prev, { availability: { ...prev.availability, availableDays } });
    });
  };

  const handlePrivacyToggle = (key: keyof DoctorSettings['privacy']) => (checked: boolean) => {
    setSettings((prev) => updateDoctorSettings(prev, { privacy: { ...prev.privacy, [key]: checked } }));
  };

  const handlePasswordChanged = () => {
    showToast({ type: 'success', title: 'Password updated (demo only).', message: 'No real credentials were changed.' });
  };

  const handleSaveChanges = () => {
    showToast({ type: 'success', title: 'Settings saved successfully.' });
  };

  const handleConfirmReset = () => {
    setSettings(getDoctorSettings(doctorId));
    setProfile(INITIAL_PROFILE);
    setResetConfirmOpen(false);
    showToast({ type: 'info', title: 'Settings reset to defaults.' });
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account & Clinical Settings"
        subtitle="Manage your profile, notifications, availability, communication preferences, and clinical workspace preferences."
        badge={<Badge variant="sandal">Doctor Account</Badge>}
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
              <dd className="font-medium text-warm-brown">{mockDoctor.name}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Role</dt>
              <dd className="font-medium text-warm-brown">Doctor</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Specialty</dt>
              <dd className="font-medium text-warm-brown">{mockDoctor.specialization}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Qualification</dt>
              <dd className="font-medium text-warm-brown">{mockDoctor.qualification}</dd>
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
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Hospital / Facility</dt>
              <dd className="font-medium text-warm-brown">{mockDoctor.hospitalName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Location</dt>
              <dd className="font-medium text-warm-brown">{profile.location || '—'}</dd>
            </div>
          </div>
        </dl>
        {profile.bio && (
          <p className="text-xs text-warm-muted leading-relaxed pt-3 border-t border-sandal-100/70">{profile.bio}</p>
        )}
      </Card>

      {/* Notification Preferences */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <Bell className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Notification Preferences</h3>
        </div>
        <SettingToggleRow
          title="In-App Notifications"
          description="Receive clinical updates and reminders inside MaaSuraksha."
          checked={settings.notifications.inApp}
          onChange={handleNotificationChange('inApp')}
        />
        <SettingToggleRow
          title="Appointment Reminders"
          description="Get reminded ahead of your scheduled patient appointments."
          checked={settings.notifications.appointmentReminders}
          onChange={handleNotificationChange('appointmentReminders')}
        />
        <SettingToggleRow
          title="Patient Messages"
          description="Receive notifications when an assigned mother sends a new message."
          checked={settings.notifications.patientMessages}
          onChange={handleNotificationChange('patientMessages')}
        />
        <SettingToggleRow
          title="Report Submissions"
          description="Get notified when a new report is uploaded for one of your patients."
          checked={settings.notifications.reportSubmissions}
          onChange={handleNotificationChange('reportSubmissions')}
        />
        <SettingToggleRow
          title="Care Plan Updates"
          description="Receive updates when a care recommendation or plan changes."
          checked={settings.notifications.carePlanUpdates}
          onChange={handleNotificationChange('carePlanUpdates')}
        />
        <SettingToggleRow
          title="Urgent Patient Alerts"
          description="Receive immediate alerts for patient situations requiring clinical review."
          checked={settings.notifications.urgentAlerts}
          onChange={handleNotificationChange('urgentAlerts')}
        />
      </Card>

      {/* Communication Preferences */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <MessageSquare className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Communication Preferences</h3>
        </div>
        <div className="max-w-xs">
          <Select
            label="Preferred Communication Method"
            value={settings.communication.preferredMethod}
            onChange={(e) => handlePreferredMethodChange(e.target.value as PreferredCommunicationMethod)}
            options={PREFERRED_COMMUNICATION_OPTIONS}
          />
        </div>
        <div className="pt-1">
          <SettingToggleRow
            title="Allow Patient-Initiated Messages"
            description="Allow assigned mothers to start a secure conversation with you."
            checked={settings.communication.allowPatientInitiatedMessages}
            onChange={handleCommunicationToggle('allowPatientInitiatedMessages')}
          />
          <SettingToggleRow
            title="Video Consultation Requests"
            description="Allow assigned mothers to request video consultations."
            checked={settings.communication.allowVideoConsultationRequests}
            onChange={handleCommunicationToggle('allowVideoConsultationRequests')}
          />
        </div>
      </Card>

      {/* Clinical Workspace */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Sliders className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Clinical Workspace</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Default Patient List"
            value={settings.workspace.defaultPatientList}
            onChange={(e) => handleWorkspaceChange('defaultPatientList', e.target.value as DefaultPatientListView)}
            options={DEFAULT_PATIENT_LIST_OPTIONS}
          />
          <Select
            label="Default Notification Filter"
            value={settings.workspace.defaultNotificationFilter}
            onChange={(e) => handleWorkspaceChange('defaultNotificationFilter', e.target.value as DefaultNotificationFilter)}
            options={DEFAULT_NOTIFICATION_FILTER_OPTIONS}
          />
          <Select
            label="Default Appointment View"
            value={settings.workspace.defaultAppointmentView}
            onChange={(e) => handleWorkspaceChange('defaultAppointmentView', e.target.value as DefaultAppointmentView)}
            options={DEFAULT_APPOINTMENT_VIEW_OPTIONS}
          />
        </div>
        <p className="text-xs text-warm-muted pt-1">
          These defaults apply the next time you open My Patients, Notifications, or Appointments.
        </p>
      </Card>

      {/* Availability & Consultation */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <CalendarClock className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Availability & Consultation</h3>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100 text-sm">
          <span className="text-warm-muted">Available Days</span>
          <span className="font-semibold text-warm-brown">{settings.availability.availableDays.length} days/week</span>
        </div>

        <div>
          <SettingToggleRow
            title="In-Person Consultation"
            description="Offer in-person visits at your assigned hospital."
            checked={settings.availability.consultationModes.inPerson}
            onChange={handleConsultationModeToggle('inPerson')}
          />
          <SettingToggleRow
            title="Video Consultation"
            description="Offer secure video consultations for eligible follow-ups."
            checked={settings.availability.consultationModes.video}
            onChange={handleConsultationModeToggle('video')}
          />
          <SettingToggleRow
            title="Phone Follow-up"
            description="Offer phone-based follow-up consultations."
            checked={settings.availability.consultationModes.phone}
            onChange={handleConsultationModeToggle('phone')}
          />
        </div>

        <div className="pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted mb-2">Available Days</p>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const isActive = settings.availability.availableDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => handleToggleAvailableDay(day)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    isActive
                      ? 'bg-sandal-500 text-white border-sandal-500 shadow-sm'
                      : 'bg-white text-warm-muted border-sandal-200 hover:border-sandal-300 hover:text-warm-brown'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ShieldCheck className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Privacy & Security</h3>
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

        <SettingToggleRow
          title="Two-Factor Authentication"
          description={
            settings.privacy.twoFactorEnabled
              ? 'Enabled — your account has an extra layer of protection at sign-in.'
              : 'Disabled — enable for an extra layer of protection at sign-in.'
          }
          checked={settings.privacy.twoFactorEnabled}
          onChange={handlePrivacyToggle('twoFactorEnabled')}
        />

        <SettingToggleRow
          title="Privacy Preferences"
          description="Share anonymized usage patterns from your clinical workspace to help improve MaaSuraksha."
          checked={settings.privacy.shareAnonymizedUsageData}
          onChange={handlePrivacyToggle('shareAnonymizedUsageData')}
        />

        <div className="py-3 border-t border-sandal-100/70 space-y-2.5">
          <p className="text-sm font-semibold text-warm-brown">Active Sessions</p>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-warm-ivory border border-sandal-100">
            <div className="w-8 h-8 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
              <Laptop className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-warm-brown">Current Browser</p>
              <p className="text-[11px] text-warm-muted">Windows • Chrome • Last active: Just now</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save / Reset */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => setResetConfirmOpen(true)}>
          Reset
        </Button>
        <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveChanges}>
          Save Changes
        </Button>
      </div>

      {/* Danger Zone */}
      <Card padding="lg" className="space-y-4 border-rose-200/70">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Danger Zone</h3>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warm-brown">Sign Out</p>
            <p className="text-xs text-warm-muted mt-0.5">End your current MaaSuraksha session on this device.</p>
          </div>
          <Button variant="danger" size="sm" leftIcon={<LogOut className="w-4 h-4" />} onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Modals */}
      <EditDoctorProfileModal
        isOpen={isEditProfileOpen}
        initialValues={profile}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSaved={handlePasswordChanged}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Settings?"
        description="This will discard any unsaved changes on this page and restore your default preferences."
        confirmLabel="Reset"
        tone="danger"
        onConfirm={handleConfirmReset}
        onClose={() => setResetConfirmOpen(false)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

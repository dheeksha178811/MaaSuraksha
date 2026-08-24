import React, { useState } from 'react';
import { Bell, Building2, Lock, Sliders } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { mockHospital } from '@/data/mockData';
import { getHospitalSettings, updateHospitalSettings } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { SettingToggleRow } from '@/pages/settings/components/SettingToggleRow';
import { ChangePasswordModal } from '@/pages/settings/components/ChangePasswordModal';
import { PATIENT_STATUS_LABELS, REFERRAL_STATUS_LABELS } from '@/pages/hospital/hospitalUi';
import { HospitalSettings, PatientCareStatus, ReferralStatus } from '@/types';

const PATIENT_LIST_OPTIONS = [
  { value: 'ALL', label: 'All Assigned Patients' },
  ...(Object.keys(PATIENT_STATUS_LABELS) as PatientCareStatus[]).map((value) => ({ value, label: PATIENT_STATUS_LABELS[value] })),
];

const REFERRAL_VIEW_OPTIONS = [
  { value: 'ALL', label: 'All' },
  ...(Object.keys(REFERRAL_STATUS_LABELS) as ReferralStatus[]).map((value) => ({ value, label: REFERRAL_STATUS_LABELS[value] })),
];

type ToastState = { type: 'success' | 'info'; title: string; message?: string } | null;

export const HospitalSettingsPage: React.FC = () => {
  const [state, reload] = useAsyncData(getHospitalSettings);
  const [draft, setDraft] = useState<HospitalSettings | null>(null);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Seed the local editable draft the first time settings load successfully.
  if (state.status === 'success' && draft === null) {
    setDraft(state.data);
  }

  const showToast = (t: ToastState) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 3000);
  };

  if (state.status !== 'success' || !draft) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hospital Settings" subtitle={mockHospital.facilityName} />
        <AsyncStateView
          status={state.status === 'success' ? 'loading' : state.status}
          loadingLabel="Loading hospital settings…"
          errorMessage={state.status === 'error' ? state.message : undefined}
          onRetry={reload}
        />
      </div>
    );
  }

  const updateDraft = (patch: Partial<HospitalSettings>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleFacilityToggle = (key: keyof HospitalSettings['facility']) => (checked: boolean) =>
    updateDraft({ facility: { ...draft.facility, [key]: checked } });

  const handleNotificationToggle = (key: keyof HospitalSettings['notifications']) => (checked: boolean) =>
    updateDraft({ notifications: { ...draft.notifications, [key]: checked } });

  const handlePrivacyToggle = (key: keyof HospitalSettings['privacy']) => (checked: boolean) =>
    updateDraft({ privacy: { ...draft.privacy, [key]: checked } });

  const handleOperationalChange = <K extends keyof HospitalSettings['operational']>(
    key: K,
    value: HospitalSettings['operational'][K]
  ) => updateDraft({ operational: { ...draft.operational, [key]: value } });

  const handleSave = async () => {
    const saved = await updateHospitalSettings(draft);
    setDraft(saved);
    showToast({ type: 'success', title: 'Settings saved successfully.' });
  };

  const handleReset = async () => {
    const fresh = await getHospitalSettings();
    setDraft(fresh);
    showToast({ type: 'info', title: 'Settings reset to defaults.' });
  };

  const handlePasswordChanged = () => {
    showToast({ type: 'success', title: 'Password updated (demo only).', message: 'No real credentials were changed.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Settings"
        subtitle="Facility preferences, notifications, operations, and privacy for this hospital."
        badge={<Badge variant="sandal">{mockHospital.facilityName}</Badge>}
      />

      {/* Facility Preferences */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <Building2 className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Facility Preferences</h3>
        </div>
        <SettingToggleRow
          title="Auto-Assign Beds"
          description="Automatically suggest an available bed when a patient is admitted."
          checked={draft.facility.autoAssignBeds}
          onChange={handleFacilityToggle('autoAssignBeds')}
        />
        <SettingToggleRow
          title="Show Bed Availability Widget"
          description="Display the live bed availability summary on the hospital dashboard."
          checked={draft.facility.showBedAvailabilityWidget}
          onChange={handleFacilityToggle('showBedAvailabilityWidget')}
        />
      </Card>

      {/* Notification Preferences */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <Bell className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Notification Preferences</h3>
        </div>
        <SettingToggleRow
          title="Critical Bed Alerts"
          description="Get notified when facility bed capacity runs low."
          checked={draft.notifications.criticalBedAlerts}
          onChange={handleNotificationToggle('criticalBedAlerts')}
        />
        <SettingToggleRow
          title="Vaccine Stock Alerts"
          description="Get notified when a vaccine batch runs low on doses."
          checked={draft.notifications.vaccineStockAlerts}
          onChange={handleNotificationToggle('vaccineStockAlerts')}
        />
        <SettingToggleRow
          title="Temperature Alerts"
          description="Get notified when cold-chain storage temperature drifts out of range."
          checked={draft.notifications.temperatureAlerts}
          onChange={handleNotificationToggle('temperatureAlerts')}
        />
        <SettingToggleRow
          title="Referral Alerts"
          description="Get notified about new and updated maternal referrals."
          checked={draft.notifications.referralAlerts}
          onChange={handleNotificationToggle('referralAlerts')}
        />
        <SettingToggleRow
          title="Delivery Notifications"
          description="Get notified when a delivery is recorded or its status changes."
          checked={draft.notifications.deliveryNotifications}
          onChange={handleNotificationToggle('deliveryNotifications')}
        />
        <SettingToggleRow
          title="Report Notifications"
          description="Get notified when a generated report is ready to review."
          checked={draft.notifications.reportNotifications}
          onChange={handleNotificationToggle('reportNotifications')}
        />
      </Card>

      {/* Operational Preferences */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Sliders className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Operational Preferences</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Default Patient List View"
            value={draft.operational.defaultPatientListView}
            onChange={(e) => handleOperationalChange('defaultPatientListView', e.target.value as PatientCareStatus | 'ALL')}
            options={PATIENT_LIST_OPTIONS}
          />
          <Select
            label="Default Referral View"
            value={draft.operational.defaultReferralView}
            onChange={(e) => handleOperationalChange('defaultReferralView', e.target.value as ReferralStatus | 'ALL')}
            options={REFERRAL_VIEW_OPTIONS}
          />
          <Input
            label="Low Stock Threshold (doses)"
            type="number"
            min={0}
            value={String(draft.operational.lowStockThreshold)}
            onChange={(e) => handleOperationalChange('lowStockThreshold', Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Lock className="w-5 h-5 text-sandal-600" />
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
          description={draft.privacy.twoFactorEnabled ? 'Enabled — an extra layer of protection at sign-in.' : 'Disabled — enable for an extra layer of protection at sign-in.'}
          checked={draft.privacy.twoFactorEnabled}
          onChange={handlePrivacyToggle('twoFactorEnabled')}
        />
        <SettingToggleRow
          title="Restrict Patient Data Export"
          description="Require additional confirmation before patient data can be exported from this facility."
          checked={draft.privacy.restrictPatientDataExport}
          onChange={handlePrivacyToggle('restrictPatientDataExport')}
        />
      </Card>

      {/* Save / Reset */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} onSaved={handlePasswordChanged} />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

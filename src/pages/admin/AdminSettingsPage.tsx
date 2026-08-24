import React, { useState } from 'react';
import { Bell, Lock, Sliders } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { getAdminSettings, updateAdminSettings } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { SettingToggleRow } from '@/pages/settings/components/SettingToggleRow';
import { ChangePasswordModal } from '@/pages/settings/components/ChangePasswordModal';
import { ALERT_STATUS_LABELS, FACILITY_STATUS_LABELS } from '@/pages/admin/adminUi';
import { AdminSettings, HospitalAlertStatus, HospitalOperationalStatus } from '@/types';

const FACILITY_VIEW_OPTIONS = [
  { value: 'ALL', label: 'All Facilities' },
  ...(Object.keys(FACILITY_STATUS_LABELS) as HospitalOperationalStatus[]).map((value) => ({ value, label: FACILITY_STATUS_LABELS[value] })),
];

const ALERT_VIEW_OPTIONS = [
  { value: 'ALL', label: 'All' },
  ...(Object.keys(ALERT_STATUS_LABELS) as HospitalAlertStatus[]).map((value) => ({ value, label: ALERT_STATUS_LABELS[value] })),
];

type ToastState = { type: 'success' | 'info'; title: string; message?: string } | null;

export const AdminSettingsPage: React.FC = () => {
  const [state, reload] = useAsyncData(getAdminSettings);
  const [draft, setDraft] = useState<AdminSettings | null>(null);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

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
        <PageHeader title="Settings" subtitle="Administrator account and program settings." />
        <AsyncStateView
          status={state.status === 'success' ? 'loading' : state.status}
          loadingLabel="Loading admin settings…"
          errorMessage={state.status === 'error' ? state.message : undefined}
          onRetry={reload}
        />
      </div>
    );
  }

  const updateDraft = (patch: Partial<AdminSettings>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleNotificationToggle = (key: keyof AdminSettings['notifications']) => (checked: boolean) =>
    updateDraft({ notifications: { ...draft.notifications, [key]: checked } });

  const handlePrivacyToggle = (key: keyof AdminSettings['privacy']) => (checked: boolean) =>
    updateDraft({ privacy: { ...draft.privacy, [key]: checked } });

  const handleProgramChange = <K extends keyof AdminSettings['program']>(key: K, value: AdminSettings['program'][K]) =>
    updateDraft({ program: { ...draft.program, [key]: value } });

  const handleSave = async () => {
    const saved = await updateAdminSettings(draft);
    setDraft(saved);
    showToast({ type: 'success', title: 'Settings saved successfully.' });
  };

  const handleReset = async () => {
    const fresh = await getAdminSettings();
    setDraft(fresh);
    showToast({ type: 'info', title: 'Settings reset to defaults.' });
  };

  const handlePasswordChanged = () => {
    showToast({ type: 'success', title: 'Password updated (demo only).', message: 'No real credentials were changed.' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Administrator account, notifications, and program preferences."
        badge={<Badge variant="sandal">Admin Account</Badge>}
      />

      {/* Notification Preferences */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100 mb-1">
          <Bell className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Notification Preferences</h3>
        </div>
        <SettingToggleRow
          title="Facility Capacity Alerts"
          description="Get notified when a facility runs low on available beds."
          checked={draft.notifications.facilityCapacityAlerts}
          onChange={handleNotificationToggle('facilityCapacityAlerts')}
        />
        <SettingToggleRow
          title="Immunization Coverage Alerts"
          description="Get notified when vaccine coverage falls below program targets."
          checked={draft.notifications.immunizationCoverageAlerts}
          onChange={handleNotificationToggle('immunizationCoverageAlerts')}
        />
        <SettingToggleRow
          title="High-Risk Case Alerts"
          description="Get notified when a new high-risk maternal case is flagged."
          checked={draft.notifications.highRiskCaseAlerts}
          onChange={handleNotificationToggle('highRiskCaseAlerts')}
        />
        <SettingToggleRow
          title="Referral Escalation Alerts"
          description="Get notified about emergency and urgent inter-facility referrals."
          checked={draft.notifications.referralEscalationAlerts}
          onChange={handleNotificationToggle('referralEscalationAlerts')}
        />
        <SettingToggleRow
          title="Weekly Digest"
          description="Receive a weekly summary of program activity across all facilities."
          checked={draft.notifications.weeklyDigest}
          onChange={handleNotificationToggle('weeklyDigest')}
        />
      </Card>

      {/* Program Preferences */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Sliders className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Program Preferences</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Default Facility View"
            value={draft.program.defaultFacilityView}
            onChange={(e) => handleProgramChange('defaultFacilityView', e.target.value as HospitalOperationalStatus | 'ALL')}
            options={FACILITY_VIEW_OPTIONS}
          />
          <Select
            label="Default Alert Filter"
            value={draft.program.defaultAlertFilter}
            onChange={(e) => handleProgramChange('defaultAlertFilter', e.target.value as HospitalAlertStatus | 'ALL')}
            options={ALERT_VIEW_OPTIONS}
          />
          <Input
            label="High-Risk Review Threshold (days)"
            type="number"
            min={1}
            value={String(draft.program.highRiskReviewThresholdDays)}
            onChange={(e) => handleProgramChange('highRiskReviewThresholdDays', Math.max(1, Number(e.target.value) || 1))}
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
          title="Restrict Data Export"
          description="Require additional confirmation before program-wide data can be exported."
          checked={draft.privacy.restrictDataExport}
          onChange={handlePrivacyToggle('restrictDataExport')}
        />
      </Card>

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

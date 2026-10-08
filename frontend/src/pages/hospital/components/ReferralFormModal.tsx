import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { REFERRAL_PRIORITY_LABELS } from '@/pages/hospital/hospitalUi';
import { CreateReferralInput, ReferralDestination, listReferralDestinations } from '@/services/referralService';
import { HospitalRosterPatient, getHospitalRoster } from '@/services/hospitalPatientService';
import { ReferralPriority } from '@/types';

interface ReferralFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Resolves on success; a rejection is shown inside the form and keeps it open.
  onSubmit: (input: CreateReferralInput) => Promise<void>;
  initialMotherId?: string;
}

// The backend identifies a patient by her real account id (a UUID) and
// re-verifies that this account is her current care assignee. The patient
// list comes from this hospital's real roster (GET /api/hospital/patients).
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRIORITY_OPTIONS = (Object.keys(REFERRAL_PRIORITY_LABELS) as ReferralPriority[]).map((value) => ({
  value,
  label: REFERRAL_PRIORITY_LABELS[value],
}));

const TEXTAREA_CLASS =
  'w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans';
const LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5';

export const ReferralFormModal: React.FC<ReferralFormModalProps> = ({ isOpen, onClose, onSubmit, initialMotherId }) => {
  const emptyForm = {
    motherId: initialMotherId || '',
    toHospitalId: '',
    priority: 'ROUTINE' as ReferralPriority,
    reason: '',
    clinicalSummary: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<ReferralDestination[]>([]);
  const [destinationsState, setDestinationsState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [patients, setPatients] = useState<HospitalRosterPatient[]>([]);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  // Real, active hospitals (never the sender's own) from the backend.
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setDestinationsState('loading');
    listReferralDestinations()
      .then((list) => {
        if (!active) return;
        setDestinations(list);
        setDestinationsState('ready');
        setForm((f) => (f.toHospitalId || list.length === 0 ? f : { ...f, toHospitalId: list[0].id }));
      })
      .catch((e) => {
        if (!active) return;
        setDestinationsState('error');
        setDestinationsError(e instanceof Error ? e.message : 'Unable to load destination hospitals.');
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  // This hospital's real patients (server-scoped to the signed-in hospital).
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setPatientsError(null);
    getHospitalRoster()
      .then((list) => {
        if (!active) return;
        setPatients(list);
        setForm((f) => (f.motherId || list.length === 0 ? f : { ...f, motherId: list[0].motherId }));
      })
      .catch((e) => active && setPatientsError(e instanceof Error ? e.message : 'Unable to load patients.'));
    return () => {
      active = false;
    };
  }, [isOpen]);

  const motherOptions = patients.map((p) => ({ value: p.motherId, label: p.motherName }));

  const resetAndClose = () => {
    setForm(emptyForm);
    setTouched(false);
    setSubmitError(null);
    onClose();
  };

  const destinationOptions = destinations.map((d) => ({ value: d.id, label: d.city ? `${d.name} — ${d.city}` : d.name }));

  const errors = {
    motherId: form.motherId ? undefined : 'Select a mother.',
    toHospitalId: form.toHospitalId ? undefined : 'Select a destination facility.',
    reason: form.reason.trim() ? undefined : 'Reason is required.',
    clinicalSummary: form.clinicalSummary.trim() ? undefined : 'Clinical summary is required.',
  };
  const isValid = Object.values(errors).every((e) => !e);

  const handleSubmit = async () => {
    setTouched(true);
    setSubmitError(null);
    if (!isValid) return;
    if (!UUID_PATTERN.test(form.motherId)) {
      setSubmitError('Select a patient from the list.');
      return;
    }
    setSubmitting(true);
    try {
      // Only what the API accepts: the sender hospital, referring doctor and
      // status are decided by the server.
      await onSubmit({
        motherId: form.motherId,
        toHospitalId: form.toHospitalId,
        reason: form.reason.trim(),
        priority: form.priority,
        clinicalSummary: form.clinicalSummary.trim(),
      });
      resetAndClose();
    } catch (e) {
      setSubmitError(e instanceof Error && e.message ? e.message : 'Unable to create the referral. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Create Referral" description="Refer a mother to another facility for specialized care." maxWidth="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Mother"
            options={motherOptions}
            helperText={patientsError ?? undefined}
            value={form.motherId}
            onChange={(e) => setForm((f) => ({ ...f, motherId: e.target.value }))}
            error={touched ? errors.motherId : undefined}
            disabled={!!initialMotherId}
          />
          <Select
            label="Destination Facility"
            options={destinationOptions}
            value={form.toHospitalId}
            onChange={(e) => setForm((f) => ({ ...f, toHospitalId: e.target.value }))}
            error={touched ? errors.toHospitalId : undefined}
            helperText={
              destinationsState === 'loading'
                ? 'Loading facilities…'
                : destinationsState === 'error'
                  ? destinationsError ?? undefined
                  : destinationsState === 'ready' && destinations.length === 0
                    ? 'No other active facilities are available.'
                    : undefined
            }
            disabled={destinationsState !== 'ready' || destinations.length === 0}
          />
        </div>
        <Select
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as ReferralPriority }))}
        />
        <div>
          <label className={LABEL_CLASS}>Reason for Referral</label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            rows={2}
            maxLength={1000}
            placeholder="Clinical reason for this referral..."
            className={TEXTAREA_CLASS}
          />
          {touched && errors.reason && <p className="text-xs text-rose-600 font-medium mt-1">{errors.reason}</p>}
        </div>
        <div>
          <label className={LABEL_CLASS}>Clinical Summary</label>
          <textarea
            value={form.clinicalSummary}
            onChange={(e) => setForm((f) => ({ ...f, clinicalSummary: e.target.value }))}
            rows={4}
            maxLength={4000}
            placeholder="Relevant history, findings and current condition for the receiving team..."
            className={TEXTAREA_CLASS}
          />
          {touched && errors.clinicalSummary && <p className="text-xs text-rose-600 font-medium mt-1">{errors.clinicalSummary}</p>}
          <p className="text-xs text-warm-muted mt-1">Shared with the receiving hospital. Full records are not shared by a referral.</p>
        </div>
        {submitError && <p className="text-sm text-rose-700 font-medium">{submitError}</p>}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Creating…' : 'Create Referral'}</Button>
        </div>
      </div>
    </Modal>
  );
};

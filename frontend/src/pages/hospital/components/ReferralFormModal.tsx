import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { mockDoctor } from '@/data/mockData';
import { hospitalMotherDirectory, referralDestinations } from '@/data/hospitalMockData';
import { REFERRAL_PRIORITY_LABELS } from '@/pages/hospital/hospitalUi';
import { CreateReferralInput } from '@/services/hospitalService';
import { ReferralPriority } from '@/types';

interface ReferralFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateReferralInput) => void;
  initialMotherId?: string;
}

const MOTHER_OPTIONS = hospitalMotherDirectory.map((m) => ({ value: m.motherId, label: m.name }));
const DESTINATION_OPTIONS = referralDestinations.map((d) => ({ value: d.hospitalId, label: d.name }));
const PRIORITY_OPTIONS = (Object.keys(REFERRAL_PRIORITY_LABELS) as ReferralPriority[]).map((value) => ({
  value,
  label: REFERRAL_PRIORITY_LABELS[value],
}));

export const ReferralFormModal: React.FC<ReferralFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialMotherId,
}) => {
  const emptyForm = {
    motherId: initialMotherId || MOTHER_OPTIONS[0]?.value || '',
    toHospitalId: DESTINATION_OPTIONS[0]?.value || '',
    priority: 'ROUTINE' as ReferralPriority,
    reason: '',
    notes: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);

  const resetAndClose = () => {
    setForm(emptyForm);
    setTouched(false);
    onClose();
  };

  const errors = {
    motherId: form.motherId ? undefined : 'Select a mother.',
    toHospitalId: form.toHospitalId ? undefined : 'Select a destination facility.',
    reason: form.reason.trim() ? undefined : 'Reason is required.',
  };
  const isValid = Object.values(errors).every((e) => !e);

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    const destination = referralDestinations.find((d) => d.hospitalId === form.toHospitalId);
    onSubmit({
      motherId: form.motherId,
      toHospitalId: form.toHospitalId,
      toHospitalName: destination?.name || 'Unknown Facility',
      referringDoctorId: mockDoctor.id,
      reason: form.reason.trim(),
      priority: form.priority,
      notes: form.notes.trim() || undefined,
    });
    resetAndClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Create Referral" description="Refer a mother to another facility for specialized care." maxWidth="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Mother"
            options={MOTHER_OPTIONS}
            value={form.motherId}
            onChange={(e) => setForm((f) => ({ ...f, motherId: e.target.value }))}
            error={touched ? errors.motherId : undefined}
            disabled={!!initialMotherId}
          />
          <Select
            label="Destination Facility"
            options={DESTINATION_OPTIONS}
            value={form.toHospitalId}
            onChange={(e) => setForm((f) => ({ ...f, toHospitalId: e.target.value }))}
            error={touched ? errors.toHospitalId : undefined}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as ReferralPriority }))}
          />
          <Select label="Referring Doctor" options={[{ value: mockDoctor.id, label: mockDoctor.name }]} value={mockDoctor.id} disabled onChange={() => {}} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Reason for Referral
          </label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            rows={3}
            placeholder="Clinical reason for this referral..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
          {touched && errors.reason && <p className="text-xs text-rose-600 font-medium mt-1">{errors.reason}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Referral</Button>
        </div>
      </div>
    </Modal>
  );
};

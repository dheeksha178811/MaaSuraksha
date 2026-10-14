import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import * as doctorService from '@/services/doctorService';
import { MaternalRiskFlag, RiskReviewDecision, WARNING_SIGN_OPTIONS } from '@/types';

const textareaClass =
  'w-full rounded-xl bg-white border border-sandal-200 px-3.5 py-2.5 text-sm text-warm-brown placeholder:text-stone-400 focus:outline-none focus:border-sandal-500 focus:ring-2 focus:ring-sandal-200';

const errorText = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Something went wrong. Please try again.');

const Notes: React.FC<{ value: string; onChange: (v: string) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted">{label}</label>
    <textarea className={textareaClass} rows={3} maxLength={500} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Footer: React.FC<{ error: string | null; submitting: boolean; onClose: () => void; submitLabel: string; disabled?: boolean }> = ({
  error,
  submitting,
  onClose,
  submitLabel,
  disabled,
}) => (
  <div className="space-y-3 pt-2">
    {error && <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
      <Button type="submit" disabled={submitting || disabled}>{submitting ? 'Saving…' : submitLabel}</Button>
    </div>
  </div>
);

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSaved: () => void;
}

export const RecordBloodPressureModal: React.FC<PatientModalProps> = ({ isOpen, onClose, patientId, patientName, onSaved }) => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { setSystolic(''); setDiastolic(''); setNotes(''); setError(null); }
  }, [isOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sys = Number(systolic);
    const dia = Number(diastolic);
    if (!Number.isInteger(sys) || !Number.isInteger(dia)) return setError('Enter both values as whole numbers.');
    if (sys <= dia) return setError('Systolic must be greater than diastolic.');
    setSubmitting(true);
    setError(null);
    try {
      await doctorService.recordBloodPressure(patientId, { systolic: sys, diastolic: dia, notes: notes.trim() || undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record blood pressure" description={`Reading for ${patientName}, recorded now.`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Systolic (mmHg)" type="number" inputMode="numeric" min={50} max={300} value={systolic} onChange={(e) => setSystolic(e.target.value)} required />
          <Input label="Diastolic (mmHg)" type="number" inputMode="numeric" min={30} max={200} value={diastolic} onChange={(e) => setDiastolic(e.target.value)} required />
        </div>
        <Notes label="Notes (optional)" value={notes} onChange={setNotes} />
        <Footer error={error} submitting={submitting} onClose={onClose} submitLabel="Save reading" />
      </form>
    </Modal>
  );
};

export const RecordWarningSignModal: React.FC<PatientModalProps> = ({ isOpen, onClose, patientId, patientName, onSaved }) => {
  const [signCode, setSignCode] = useState(WARNING_SIGN_OPTIONS[0].value);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { setSignCode(WARNING_SIGN_OPTIONS[0].value); setNotes(''); setError(null); }
  }, [isOpen]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await doctorService.recordWarningSign(patientId, { signCode, notes: notes.trim() || undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record warning sign" description={`Observed or reported for ${patientName}, dated today.`}>
      <form onSubmit={submit} className="space-y-4">
        <Select label="Warning sign" value={signCode} onChange={(e) => setSignCode(e.target.value)} options={WARNING_SIGN_OPTIONS} />
        <Notes label="Notes (optional)" value={notes} onChange={setNotes} />
        <Footer error={error} submitting={submitting} onClose={onClose} submitLabel="Save warning sign" />
      </form>
    </Modal>
  );
};

export const ReviewFlagModal: React.FC<{
  flag: MaternalRiskFlag | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ flag, onClose, onSaved }) => {
  const [decision, setDecision] = useState<RiskReviewDecision>('CONFIRMED');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flag) { setDecision(flag.review?.decision ?? 'CONFIRMED'); setNote(flag.review?.note ?? ''); setError(null); }
  }, [flag]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag) return;
    setSubmitting(true);
    setError(null);
    try {
      await doctorService.reviewRiskFlag(flag.patientId, { flagKey: flag.flagKey, decision, note: note.trim() || undefined });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!flag} onClose={onClose} title="Review flag" description={flag ? `${flag.patientName} — ${flag.title}` : undefined}>
      {flag && (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-warm-brown bg-warm-cream rounded-xl px-3.5 py-3 border border-sandal-100">{flag.reason}</p>
          <p className="text-xs text-warm-muted">
            This flag comes from a screening rule, not a diagnosis. Your decision is recorded against this specific event only.
          </p>
          <Select
            label="Your decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value as RiskReviewDecision)}
            options={[
              { value: 'CONFIRMED', label: 'Clinically relevant — follow up' },
              { value: 'DISMISSED', label: 'Not clinically relevant — dismiss' },
            ]}
          />
          <Notes label="Note (optional)" value={note} onChange={setNote} />
          <Footer error={error} submitting={submitting} onClose={onClose} submitLabel="Save review" />
        </form>
      )}
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { GrowthRecipientType } from '@/types';
import { LogMeasurementInput } from '@/data/motherGrowthMockData';
import { mockChild, mockMother } from '@/data/mockData';

const RECIPIENT_OPTIONS: { value: GrowthRecipientType; label: string }[] = [
  { value: 'MOTHER', label: `Myself (${mockMother.name})` },
  { value: 'CHILD', label: `${mockChild.name} (Child)` },
];

interface LogMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: LogMeasurementInput) => void;
}

export const LogMeasurementModal: React.FC<LogMeasurementModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [recipientType, setRecipientType] = useState<GrowthRecipientType>('CHILD');
  const [date, setDate] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('');
  const [notes, setNotes] = useState('');

  const resetAndClose = () => {
    setRecipientType('CHILD');
    setDate('');
    setWeightKg('');
    setHeightCm('');
    setHeadCircumferenceCm('');
    setNotes('');
    onClose();
  };

  const handleSubmit = () => {
    if (!date || (!weightKg && !heightCm && !headCircumferenceCm)) {
      alert('Please provide a date and at least one measurement (weight, height, or head circumference).');
      return;
    }
    onSubmit({
      recipientType,
      date,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      headCircumferenceCm:
        recipientType === 'CHILD' && headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined,
      notes: notes || undefined,
    });
    resetAndClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Log a Measurement"
      description="Record a weight, height, or head circumference reading taken at home."
      maxWidth="md"
    >
      <div className="space-y-4">
        <Select
          label="Who is this for?"
          options={RECIPIENT_OPTIONS}
          value={recipientType}
          onChange={(e) => setRecipientType(e.target.value as GrowthRecipientType)}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            placeholder="e.g., 4.3"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
          <Input
            label="Height / Length (cm)"
            type="number"
            step="0.1"
            placeholder="e.g., 54"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
        </div>
        {recipientType === 'CHILD' && (
          <Input
            label="Head Circumference (cm) — optional"
            type="number"
            step="0.1"
            placeholder="e.g., 37"
            value={headCircumferenceCm}
            onChange={(e) => setHeadCircumferenceCm(e.target.value)}
          />
        )}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything worth remembering about this reading..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <p className="text-xs text-warm-muted">
          Home measurements are for your own tracking and don't replace your doctor's official growth checks.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Measurement</Button>
        </div>
      </div>
    </Modal>
  );
};

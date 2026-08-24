import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { mockDoctor } from '@/data/mockData';
import { hospitalMotherDirectory } from '@/data/hospitalMockData';
import { DELIVERY_TYPE_LABELS } from '@/pages/hospital/hospitalUi';
import { CreateDeliveryInput } from '@/services/hospitalService';
import { DeliveryType } from '@/types';

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateDeliveryInput) => void;
}

const DELIVERY_TYPE_OPTIONS = (Object.keys(DELIVERY_TYPE_LABELS) as DeliveryType[]).map((value) => ({
  value,
  label: DELIVERY_TYPE_LABELS[value],
}));

const MOTHER_OPTIONS = hospitalMotherDirectory.map((m) => ({ value: m.motherId, label: m.name }));

const EMPTY_FORM = {
  motherId: MOTHER_OPTIONS[0]?.value || '',
  date: '',
  time: '',
  deliveryType: 'VAGINAL' as DeliveryType,
  gestationalAge: '',
  babyCount: '1',
  maternalOutcome: '',
  notes: '',
};

export const DeliveryFormModal: React.FC<DeliveryFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState(false);

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    setTouched(false);
    onClose();
  };

  const gestationalAgeNum = Number(form.gestationalAge);
  const babyCountNum = Number(form.babyCount);

  const errors = {
    motherId: form.motherId ? undefined : 'Select a mother.',
    date: form.date ? undefined : 'Date is required.',
    time: form.time ? undefined : 'Time is required.',
    gestationalAge:
      form.gestationalAge && gestationalAgeNum > 0 ? undefined : 'Enter a valid gestational age in weeks.',
    babyCount: form.babyCount && babyCountNum >= 1 ? undefined : 'Baby count must be at least 1.',
    maternalOutcome: form.maternalOutcome.trim() ? undefined : 'Maternal outcome is required.',
  };
  const isValid = Object.values(errors).every((e) => !e);

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onSubmit({
      motherId: form.motherId,
      doctorId: mockDoctor.id,
      deliveryDate: form.date,
      deliveryTime: form.time,
      deliveryType: form.deliveryType,
      gestationalAge: gestationalAgeNum,
      babyCount: babyCountNum,
      maternalOutcome: form.maternalOutcome.trim(),
      notes: form.notes.trim() || undefined,
    });
    resetAndClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Record Delivery" description="Add a delivery to the facility registry." maxWidth="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Mother"
            options={MOTHER_OPTIONS}
            value={form.motherId}
            onChange={(e) => setForm((f) => ({ ...f, motherId: e.target.value }))}
            error={touched ? errors.motherId : undefined}
          />
          <Input label="Doctor" value={mockDoctor.name} disabled />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            error={touched ? errors.date : undefined}
          />
          <Input
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            error={touched ? errors.time : undefined}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Delivery Type"
            options={DELIVERY_TYPE_OPTIONS}
            value={form.deliveryType}
            onChange={(e) => setForm((f) => ({ ...f, deliveryType: e.target.value as DeliveryType }))}
          />
          <Input
            label="Gestational Age (weeks)"
            type="number"
            min={0}
            value={form.gestationalAge}
            onChange={(e) => setForm((f) => ({ ...f, gestationalAge: e.target.value }))}
            error={touched ? errors.gestationalAge : undefined}
          />
          <Input
            label="Baby Count"
            type="number"
            min={1}
            value={form.babyCount}
            onChange={(e) => setForm((f) => ({ ...f, babyCount: e.target.value }))}
            error={touched ? errors.babyCount : undefined}
          />
        </div>
        <Input
          label="Maternal Outcome"
          placeholder="e.g., Stable, normal recovery"
          value={form.maternalOutcome}
          onChange={(e) => setForm((f) => ({ ...f, maternalOutcome: e.target.value }))}
          error={touched ? errors.maternalOutcome : undefined}
        />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Clinical notes about the delivery..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Delivery</Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AppointmentCategory } from '@/types';
import { APPOINTMENT_CATEGORY_LABELS, RequestAppointmentInput } from '@/data/motherAppointmentsMockData';
import { mockDoctor, mockHospital } from '@/data/mockData';

const CATEGORY_OPTIONS = (Object.keys(APPOINTMENT_CATEGORY_LABELS) as AppointmentCategory[]).map((value) => ({
  value,
  label: APPOINTMENT_CATEGORY_LABELS[value],
}));

interface RequestAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: RequestAppointmentInput) => void;
}

export const RequestAppointmentModal: React.FC<RequestAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState<AppointmentCategory>('ANTENATAL_CHECKUP');
  const [reason, setReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const resetAndClose = () => {
    setCategory('ANTENATAL_CHECKUP');
    setReason('');
    setPreferredDate('');
    setPreferredTime('');
    onClose();
  };

  const handleSubmit = () => {
    if (!preferredDate || !preferredTime || !reason) {
      alert('Please provide a preferred date, time, and reason for this appointment request.');
      return;
    }
    onSubmit({ category, reason, preferredDate, preferredTime });
    resetAndClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Request an Appointment"
      description={`With ${mockDoctor.name} at ${mockHospital.name}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <Select
          label="Appointment Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value as AppointmentCategory)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preferred Date"
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
          <Input
            label="Preferred Time"
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Reason for Visit
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g., Routine antenatal check-up, follow-up on last test results..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <p className="text-xs text-warm-muted">
          Your request will be sent to {mockHospital.name} for confirmation. You'll see it here as "Requested" until it's confirmed.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Send Request</Button>
        </div>
      </div>
    </Modal>
  );
};

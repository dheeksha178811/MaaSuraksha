import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MotherAppointment } from '@/types';

interface RescheduleAppointmentModalProps {
  appointment: MotherAppointment;
  onClose: () => void;
  onConfirm: (appointment: MotherAppointment, newDate: string, newTime: string) => void;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  appointment,
  onClose,
  onConfirm,
}) => {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (!date || !time) {
      alert('Please choose a new date and time for this appointment.');
      return;
    }
    onConfirm(appointment, date, time);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Reschedule Appointment"
      description={appointment.title}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="New Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="New Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <p className="text-xs text-warm-muted">
          Currently scheduled for {appointment.date} at {appointment.time} with {appointment.doctorName}.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Back</Button>
          <Button onClick={handleSubmit}>Confirm New Time</Button>
        </div>
      </div>
    </Modal>
  );
};

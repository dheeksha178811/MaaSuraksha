import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MotherAppointment } from '@/types';

interface CancelAppointmentModalProps {
  appointment: MotherAppointment;
  onClose: () => void;
  onConfirm: (appointment: MotherAppointment) => void;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  appointment,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen onClose={onClose} title="Cancel Appointment?" maxWidth="sm">
      <div className="space-y-5">
        <div className="flex gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-800 leading-relaxed">
            This will cancel "{appointment.title}" on {appointment.date} at {appointment.time}. You can request a new appointment anytime.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Keep Appointment</Button>
          <Button variant="danger" onClick={() => onConfirm(appointment)}>Yes, Cancel It</Button>
        </div>
      </div>
    </Modal>
  );
};

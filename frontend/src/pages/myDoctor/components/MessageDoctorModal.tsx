import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { mockDoctor, mockHospital } from '@/data/mockData';

interface MessageDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: (message: string) => void;
}

export const MessageDoctorModal: React.FC<MessageDoctorModalProps> = ({ isOpen, onClose, onSent }) => {
  const [message, setMessage] = useState('');

  const resetAndClose = () => {
    setMessage('');
    onClose();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSent(message.trim());
    resetAndClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Message Your Care Team"
      description={`To ${mockDoctor.name} at ${mockHospital.name}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="e.g., I have a question about my feeding schedule before the next visit..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <p className="text-xs text-warm-muted">
          This is routed to your care team at {mockHospital.name} and is not for emergencies. For urgent concerns, use the Emergency Hotline instead.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!message.trim()}>Send Message</Button>
        </div>
      </div>
    </Modal>
  );
};

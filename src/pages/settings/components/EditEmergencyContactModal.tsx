import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmergencyContact } from '@/types';

interface EditEmergencyContactModalProps {
  isOpen: boolean;
  initialValues: EmergencyContact;
  onClose: () => void;
  onSave: (values: EmergencyContact) => void;
}

export const EditEmergencyContactModal: React.FC<EditEmergencyContactModalProps> = ({
  isOpen,
  initialValues,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<EmergencyContact>(initialValues);

  useEffect(() => {
    if (isOpen) setValues(initialValues);
  }, [isOpen, initialValues]);

  const isValid = values.name.trim() !== '' && values.phone.trim() !== '';

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      name: values.name.trim(),
      relation: values.relation.trim(),
      phone: values.phone.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Emergency Contact"
      description="This contact is shown on your MaaSuraksha QR care card for emergencies."
      maxWidth="md"
    >
      <div className="space-y-4">
        <Input
          label="Contact Name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          error={values.name.trim() === '' ? 'Contact name is required.' : undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Relationship"
            value={values.relation}
            onChange={(e) => setValues((v) => ({ ...v, relation: e.target.value }))}
          />
          <Input
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            error={values.phone.trim() === '' ? 'Phone number is required.' : undefined}
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>Save Contact</Button>
        </div>
      </div>
    </Modal>
  );
};

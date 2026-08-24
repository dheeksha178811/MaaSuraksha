import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface ProfileFormValues {
  name: string;
  phone: string;
  email: string;
  location: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  initialValues: ProfileFormValues;
  onClose: () => void;
  onSave: (values: ProfileFormValues) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  initialValues,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);

  useEffect(() => {
    if (isOpen) setValues(initialValues);
  }, [isOpen, initialValues]);

  const isValid = values.name.trim() !== '' && values.email.trim() !== '';

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      location: values.location.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" description="Update your basic account details." maxWidth="md">
      <div className="space-y-4">
        <Input
          label="Name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          error={values.name.trim() === '' ? 'Name is required.' : undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            error={values.email.trim() === '' ? 'Email is required.' : undefined}
          />
        </div>
        <Input
          label="Location"
          value={values.location}
          onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DoctorProfileFormValues } from '@/types';

interface EditDoctorProfileModalProps {
  isOpen: boolean;
  initialValues: DoctorProfileFormValues;
  onClose: () => void;
  onSave: (values: DoctorProfileFormValues) => void;
}

export const EditDoctorProfileModal: React.FC<EditDoctorProfileModalProps> = ({
  isOpen,
  initialValues,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<DoctorProfileFormValues>(initialValues);

  useEffect(() => {
    if (isOpen) setValues(initialValues);
  }, [isOpen, initialValues]);

  const isValid = values.email.trim() !== '';

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      phone: values.phone.trim(),
      email: values.email.trim(),
      location: values.location.trim(),
      bio: values.bio.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your contact details and professional bio. Your name, specialty, qualification, and assigned hospital are managed by MaaSuraksha and cannot be edited here."
      maxWidth="md"
    >
      <div className="space-y-4">
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
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Professional Bio
          </label>
          <textarea
            value={values.bio}
            onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
            rows={4}
            placeholder="A short bio visible to your care team..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};

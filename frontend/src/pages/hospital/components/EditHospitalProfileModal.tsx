import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { HospitalProfileUpdate } from '@/services/hospitalService';
import { HospitalProfile } from '@/types';

interface EditHospitalProfileModalProps {
  isOpen: boolean;
  hospital: HospitalProfile;
  onClose: () => void;
  onSave: (patch: HospitalProfileUpdate) => void;
}

export const EditHospitalProfileModal: React.FC<EditHospitalProfileModalProps> = ({
  isOpen,
  hospital,
  onClose,
  onSave,
}) => {
  const buildInitial = () => ({
    address: hospital.address,
    city: hospital.city,
    state: hospital.state,
    postalCode: hospital.postalCode || '',
    contactNumber: hospital.contactNumber,
    totalBeds: String(hospital.totalBeds),
  });
  const [form, setForm] = useState(buildInitial);

  useEffect(() => {
    if (isOpen) setForm(buildInitial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const totalBedsNum = Number(form.totalBeds);
  const isValid = form.address.trim() !== '' && form.contactNumber.trim() !== '' && totalBedsNum > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim() || undefined,
      contactNumber: form.contactNumber.trim(),
      totalBeds: totalBedsNum,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hospital Profile"
      description="Facility ID and license number are managed by MaaSuraksha and cannot be edited here."
      maxWidth="lg"
    >
      <div className="space-y-4">
        <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          <Input label="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
          <Input label="Postal Code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Contact Number" value={form.contactNumber} onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))} />
          <Input
            label="Total Beds"
            type="number"
            min={1}
            value={form.totalBeds}
            onChange={(e) => setForm((f) => ({ ...f, totalBeds: e.target.value }))}
            error={totalBedsNum > 0 ? undefined : 'Total beds must be at least 1.'}
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

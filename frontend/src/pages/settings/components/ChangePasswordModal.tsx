import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const mismatch = form.newPassword !== '' && form.confirmPassword !== '' && form.newPassword !== form.confirmPassword;
  const tooShort = form.newPassword !== '' && form.newPassword.length < 6;
  const isValid =
    form.currentPassword.trim() !== '' &&
    form.newPassword.trim() !== '' &&
    form.confirmPassword.trim() !== '' &&
    !mismatch &&
    !tooShort;

  const handleSave = () => {
    if (!isValid) return;
    onSaved();
    resetAndClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Change Password"
      description="This is a demo interaction — no password is actually stored or changed yet."
      maxWidth="md"
    >
      <div className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
        />
        <Input
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
          error={tooShort ? 'New password must be at least 6 characters.' : undefined}
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          error={mismatch ? 'Passwords do not match.' : undefined}
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>Update Password</Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ReceiveVaccineStockInput } from '@/services/hospitalService';

interface VaccineReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ReceiveVaccineStockInput) => void;
}

const EMPTY_FORM = {
  vaccineName: '',
  vaccineCode: '',
  batchNumber: '',
  manufacturer: '',
  quantityReceived: '',
  expiryDate: '',
  storageLocation: '',
  minTemperature: '2',
  maxTemperature: '8',
};

export const VaccineReceiveStockModal: React.FC<VaccineReceiveStockModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState(false);

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    setTouched(false);
    onClose();
  };

  const quantity = Number(form.quantityReceived);
  const expiryValid = form.expiryDate !== '' && !Number.isNaN(Date.parse(form.expiryDate));

  const errors = {
    vaccineName: form.vaccineName.trim() ? undefined : 'Vaccine name is required.',
    batchNumber: form.batchNumber.trim() ? undefined : 'Batch number is required.',
    manufacturer: form.manufacturer.trim() ? undefined : 'Manufacturer is required.',
    quantityReceived: form.quantityReceived && quantity >= 0 ? undefined : 'Quantity cannot be negative.',
    expiryDate: expiryValid ? undefined : 'Enter a valid expiry date.',
    storageLocation: form.storageLocation.trim() ? undefined : 'Storage location is required.',
  };
  const isValid = Object.values(errors).every((e) => !e);

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onSubmit({
      vaccineName: form.vaccineName.trim(),
      vaccineCode: form.vaccineCode.trim() || form.vaccineName.trim().slice(0, 6).toUpperCase(),
      batchNumber: form.batchNumber.trim(),
      manufacturer: form.manufacturer.trim(),
      quantityReceived: quantity,
      expiryDate: form.expiryDate,
      storageLocation: form.storageLocation.trim(),
      minTemperature: Number(form.minTemperature) || 2,
      maxTemperature: Number(form.maxTemperature) || 8,
    });
    resetAndClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Receive Vaccine Stock" description="Add a new batch to the cold-chain inventory." maxWidth="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Vaccine Name"
            value={form.vaccineName}
            onChange={(e) => setForm((f) => ({ ...f, vaccineName: e.target.value }))}
            error={touched ? errors.vaccineName : undefined}
          />
          <Input
            label="Vaccine Code (optional)"
            value={form.vaccineCode}
            onChange={(e) => setForm((f) => ({ ...f, vaccineCode: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Batch Number"
            value={form.batchNumber}
            onChange={(e) => setForm((f) => ({ ...f, batchNumber: e.target.value }))}
            error={touched ? errors.batchNumber : undefined}
          />
          <Input
            label="Manufacturer"
            value={form.manufacturer}
            onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
            error={touched ? errors.manufacturer : undefined}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Quantity Received"
            type="number"
            min={0}
            value={form.quantityReceived}
            onChange={(e) => setForm((f) => ({ ...f, quantityReceived: e.target.value }))}
            error={touched ? errors.quantityReceived : undefined}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            error={touched ? errors.expiryDate : undefined}
          />
        </div>
        <Input
          label="Storage Location"
          placeholder="e.g., Cold Room A — Shelf 2"
          value={form.storageLocation}
          onChange={(e) => setForm((f) => ({ ...f, storageLocation: e.target.value }))}
          error={touched ? errors.storageLocation : undefined}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Min Temperature (°C)"
            type="number"
            value={form.minTemperature}
            onChange={(e) => setForm((f) => ({ ...f, minTemperature: e.target.value }))}
          />
          <Input
            label="Max Temperature (°C)"
            type="number"
            value={form.maxTemperature}
            onChange={(e) => setForm((f) => ({ ...f, maxTemperature: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Receive Stock</Button>
        </div>
      </div>
    </Modal>
  );
};

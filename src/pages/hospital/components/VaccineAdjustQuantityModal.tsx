import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VaccineInventoryItem } from '@/types';

interface VaccineAdjustQuantityModalProps {
  isOpen: boolean;
  item: VaccineInventoryItem | null;
  onClose: () => void;
  onSubmit: (id: string, quantityAvailable: number) => void;
}

export const VaccineAdjustQuantityModal: React.FC<VaccineAdjustQuantityModalProps> = ({
  isOpen,
  item,
  onClose,
  onSubmit,
}) => {
  const [quantity, setQuantity] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (item) setQuantity(String(item.quantityAvailable));
    setTouched(false);
  }, [item]);

  if (!item) return null;

  const parsed = Number(quantity);
  const error = quantity !== '' && parsed >= 0 ? undefined : 'Quantity cannot be negative.';

  const handleSubmit = () => {
    setTouched(true);
    if (error) return;
    onSubmit(item.id, parsed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Quantity"
      description={`${item.vaccineName} — Batch ${item.batchNumber}`}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-xs text-warm-muted">
          Currently available: <span className="font-semibold text-warm-brown">{item.quantityAvailable} doses</span>
        </p>
        <Input
          label="New Available Quantity"
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={touched ? error : undefined}
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Adjustment</Button>
        </div>
      </div>
    </Modal>
  );
};

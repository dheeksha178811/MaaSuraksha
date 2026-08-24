import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { VaccineInventoryItem } from '@/types';
import {
  TEMPERATURE_STATUS_LABELS,
  VACCINE_STATUS_LABELS,
  getTemperatureStatusBadgeVariant,
  getVaccineStatusBadgeVariant,
} from '@/pages/hospital/hospitalUi';

interface VaccineBatchDetailsModalProps {
  isOpen: boolean;
  item: VaccineInventoryItem | null;
  onClose: () => void;
  onToggleQuarantine: (item: VaccineInventoryItem) => void;
}

export const VaccineBatchDetailsModal: React.FC<VaccineBatchDetailsModalProps> = ({
  isOpen,
  item,
  onClose,
  onToggleQuarantine,
}) => {
  if (!item) return null;

  const canToggleQuarantine = item.status === 'AVAILABLE' || item.status === 'LOW_STOCK' || item.status === 'QUARANTINED';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.vaccineName} description={`Batch ${item.batchNumber}`} maxWidth="md">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={getVaccineStatusBadgeVariant(item.status)}>{VACCINE_STATUS_LABELS[item.status]}</Badge>
          <Badge variant={getTemperatureStatusBadgeVariant(item.temperatureStatus)}>
            {TEMPERATURE_STATUS_LABELS[item.temperatureStatus]} ({item.currentTemperature}°C)
          </Badge>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-warm-muted">Manufacturer</dt>
            <dd className="font-medium text-warm-brown">{item.manufacturer}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Storage Location</dt>
            <dd className="font-medium text-warm-brown">{item.storageLocation}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Quantity Received</dt>
            <dd className="font-medium text-warm-brown">{item.quantityReceived} doses</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Quantity Available</dt>
            <dd className="font-medium text-warm-brown">{item.quantityAvailable} doses</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Received</dt>
            <dd className="font-medium text-warm-brown">{formatDate(item.receivedDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Expiry Date</dt>
            <dd className="font-medium text-warm-brown">{formatDate(item.expiryDate)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-warm-muted">Temperature Range</dt>
            <dd className="font-medium text-warm-brown">{item.minTemperature}°C – {item.maxTemperature}°C</dd>
          </div>
        </dl>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canToggleQuarantine && (
            <Button
              variant={item.status === 'QUARANTINED' ? 'sage' : 'danger'}
              onClick={() => onToggleQuarantine(item)}
            >
              {item.status === 'QUARANTINED' ? 'Mark Available' : 'Mark Quarantined'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

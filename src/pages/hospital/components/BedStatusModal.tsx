import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { BED_STATUS_LABELS } from '@/pages/hospital/hospitalUi';
import { HospitalBedView, HospitalPatientView } from '@/services/hospitalService';
import { BedStatus } from '@/types';

interface BedStatusModalProps {
  isOpen: boolean;
  bed: HospitalBedView | null;
  assignablePatients: HospitalPatientView[];
  onClose: () => void;
  onSubmit: (bedId: string, status: BedStatus, patientId?: string) => void;
}

const STATUS_OPTIONS = (Object.keys(BED_STATUS_LABELS) as BedStatus[]).map((value) => ({
  value,
  label: BED_STATUS_LABELS[value],
}));

export const BedStatusModal: React.FC<BedStatusModalProps> = ({
  isOpen,
  bed,
  assignablePatients,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState<BedStatus>('AVAILABLE');
  const [patientId, setPatientId] = useState<string>('');

  useEffect(() => {
    if (bed) {
      setStatus(bed.status);
      setPatientId(bed.patientId || '');
    }
  }, [bed]);

  if (!bed) return null;

  const canAssignPatient = status === 'OCCUPIED' || status === 'RESERVED';
  const patientOptions = [
    { value: '', label: 'None / not tracked in roster' },
    ...assignablePatients.map((p) => ({ value: p.id, label: `${p.motherName} (${p.id})` })),
  ];

  const handleSubmit = () => {
    onSubmit(bed.id, status, canAssignPatient ? patientId || undefined : undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Bed ${bed.bedNumber}`}
      description={`${bed.ward} • ${bed.bedType}`}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <Select
          label="Bed Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value as BedStatus)}
        />
        {canAssignPatient && (
          <Select
            label="Assigned Patient"
            options={patientOptions}
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            helperText="Only admitted patients without a bed are listed."
          />
        )}
        {!canAssignPatient && (
          <p className="text-xs text-warm-muted">
            Available and Maintenance beds cannot have a patient assigned.
          </p>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update Bed</Button>
        </div>
      </div>
    </Modal>
  );
};

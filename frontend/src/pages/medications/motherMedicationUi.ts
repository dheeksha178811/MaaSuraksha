import { MedicationStatus } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getMedicationStatusBadgeVariant = (status: MedicationStatus): BadgeVariant => {
  switch (status) {
    case 'active':
      return 'sage';
    case 'completed':
      return 'warm';
    default:
      return 'outline';
  }
};

export const getMedicationStatusLabel = (status: MedicationStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

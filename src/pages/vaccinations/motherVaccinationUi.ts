import { Baby, HeartPulse, LucideIcon } from 'lucide-react';
import { VaccineRecipientType, VaccineStatus } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getVaccineStatusBadgeVariant = (status: VaccineStatus): BadgeVariant => {
  switch (status) {
    case 'completed':
      return 'sage';
    case 'due_soon':
      return 'sandal';
    case 'upcoming':
      return 'warm';
    case 'overdue':
      return 'danger';
    default:
      return 'outline';
  }
};

export const getVaccineStatusLabel = (status: VaccineStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'due_soon':
      return 'Due Soon';
    case 'upcoming':
      return 'Upcoming';
    case 'overdue':
      return 'Overdue';
    default:
      return status;
  }
};

export const getRecipientIcon = (recipientType: VaccineRecipientType): LucideIcon =>
  recipientType === 'MOTHER' ? HeartPulse : Baby;

export const getRecipientLabel = (recipientType: VaccineRecipientType): string =>
  recipientType === 'MOTHER' ? 'Maternal' : 'Child';

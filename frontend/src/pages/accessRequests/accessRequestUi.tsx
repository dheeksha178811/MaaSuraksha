import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ConsentStatus } from '@/services/consentService';

const STATUS_BADGE: Record<ConsentStatus, { label: string; variant: 'peach' | 'sage' | 'danger' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'peach' },
  approved: { label: 'Approved', variant: 'sage' },
  denied: { label: 'Denied', variant: 'danger' },
  expired: { label: 'Expired', variant: 'outline' },
};

export const ConsentStatusBadge: React.FC<{ status: ConsentStatus }> = ({ status }) => (
  <Badge variant={STATUS_BADGE[status].variant}>{STATUS_BADGE[status].label}</Badge>
);

export const APPROVE_CONFIRMATION =
  'Approving gives this healthcare provider temporary access to the selected information.';

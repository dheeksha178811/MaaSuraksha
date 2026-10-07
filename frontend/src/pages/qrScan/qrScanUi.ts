import { formatDate } from '@/utils/formatters';
import { AuthNetworkError } from '@/services/authApi';
import { QrScanError } from '@/services/qrService';

// Shared by the Scan Patient QR page and the mobile /q landing page.

export const STAGE_LABELS: Record<string, string> = {
  pregnancy: 'Pregnancy',
  postpartum: 'Postpartum',
  infant_care: 'Infant Care',
};

export interface ScanFailure {
  title: string;
  description: string;
  showSignIn?: boolean;
}

export function describeScanFailure(error: unknown): ScanFailure {
  if (error instanceof QrScanError) {
    switch (error.status) {
      case 400:
        return {
          title: 'Invalid QR code',
          description: 'That does not look like a MaaSuraksha QR code. Check that the full link or token was pasted and try again.',
        };
      case 401:
        return {
          title: 'Sign in required',
          description: 'Your session is missing or has expired. Sign in again with your real account to look up a patient.',
          showSignIn: true,
        };
      case 403:
        return {
          title: 'Not permitted',
          description: 'Only doctor and hospital accounts can look up a patient QR.',
        };
      case 404:
        return {
          title: 'No matching patient',
          description:
            'This QR code was not recognised, or the patient is not under your active care. Only the assigned doctor or hospital can view this card.',
        };
      default:
        return { title: 'Lookup failed', description: error.message };
    }
  }
  if (error instanceof AuthNetworkError) {
    return { title: 'Server unreachable', description: error.message };
  }
  return { title: 'Lookup failed', description: 'Something went wrong. Please try again.' };
}

export const displayOrDash = (value: string | null) => value || '—';
export const dateOrDash = (value: string | null) => (value ? formatDate(value) : '—');

// ---------------------------------------------------------------------------
// Real backend client for clinician QR lookup — GET /api/qr/scan/:token.
// Shared by the Doctor and Hospital "Scan Patient QR" pages. The backend only
// resolves a token for a doctor/hospital with an active care assignment to
// the mother whose card it is; everything else comes back as 400/401/403/404.
//
// Unlike the other services' authedFetch, errors here keep the HTTP status
// (QrScanError.status) so the page can tell "invalid token" from "session
// expired" from "wrong role" from "not found / no access" — each needs a
// different message and next step. No mock fallback: requires a real JWT.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';

export class QrScanError extends AuthApiError {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface QrScanPatient {
  maaSurakshaId: string;
  motherName: string;
  bloodGroup: string | null;
  stage: string | null;
  location: string | null;
  issuedDate: string | null;
  validThrough: string | null;
  emergencyContactName: string | null;
  emergencyContactRelation: string | null;
  emergencyContactPhone: string | null;
  assignedDoctorName: string | null;
  assignedHospitalName: string | null;
}

// Same shape the backend enforces (qrController.ts) — lets an obviously
// malformed paste be rejected before a round trip. Callers should normalize
// with normalizeQrToken first.
const QR_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export function normalizeQrToken(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidQrToken(token: string): boolean {
  return QR_TOKEN_PATTERN.test(token);
}

export async function scanQrToken(token: string): Promise<QrScanPatient> {
  const authToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!authToken) {
    throw new QrScanError('Sign in with your real account to look up a patient QR.', 401);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/qr/scan/${encodeURIComponent(token)}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.message === 'string' ? body.message : `Request failed with status ${res.status}.`;
    throw new QrScanError(message, res.status);
  }
  return body.patient as QrScanPatient;
}

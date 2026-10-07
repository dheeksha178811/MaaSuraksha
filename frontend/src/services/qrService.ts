// ---------------------------------------------------------------------------
// Real backend client for clinician QR lookup — POST /api/qr/scan.
// Shared by the Doctor and Hospital "Scan Patient QR" pages and the mobile
// /q landing page. The backend only resolves a token for a doctor/hospital
// with an active care assignment to the mother whose card it is; everything
// else comes back as 400/401/403/404.
//
// Unlike the other services' authedFetch, errors here keep the HTTP status
// (QrScanError.status) so the page can tell "invalid token" from "session
// expired" from "wrong role" from "not found / no access" — each needs a
// different message and next step. No mock fallback: requires a real JWT.
//
// QR payload: the mother's QR encodes a MaaSuraksha link, `<origin>/q#t=<token>`.
// The token is opaque (no PHI) and sits in the URL *fragment*, which browsers
// never send to a server, so it stays out of access logs and Referer headers.
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

// --- QR link (payload) ------------------------------------------------------

export const QR_LANDING_PATH = '/q';

// VITE_PUBLIC_APP_URL (when set) wins so a QR generated on one device still
// points at the address clinicians' phones can actually reach; otherwise the
// origin the mother is currently using.
function getPublicAppOrigin(): string {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL;
  if (typeof configured === 'string' && configured.trim()) {
    try {
      const url = new URL(configured.trim());
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.origin;
    } catch {
      // Malformed value — fall back to the current origin below.
    }
  }
  return window.location.origin;
}

export function buildQrUrl(token: string): string {
  return `${getPublicAppOrigin()}${QR_LANDING_PATH}#t=${token}`;
}

// Pulls the token out of a `t=<token>` URL fragment (e.g. "#t=abc…"). Returns
// null when the fragment doesn't carry a well-formed token.
export function tokenFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const token = normalizeQrToken(params.get('t') ?? '');
  return isValidQrToken(token) ? token : null;
}

// Accepts whatever a clinician pastes — a bare 64-character token (older
// cards) or a full MaaSuraksha QR link — and returns the token, or null.
export function parseQrInput(raw: string): string | null {
  const trimmed = raw.trim();
  const bare = normalizeQrToken(trimmed);
  if (isValidQrToken(bare)) return bare;

  try {
    const url = new URL(trimmed);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.pathname === QR_LANDING_PATH) {
      return tokenFromHash(url.hash);
    }
  } catch {
    // Not a URL.
  }
  return null;
}

// --- Pending scan (survives the login redirect, this tab only) ---------------

// The /q page strips the token from the address bar immediately; this keeps it
// for the sign-in round trip. sessionStorage is tab-scoped and the entry is
// removed as soon as the lookup finishes.
const PENDING_QR_TOKEN_KEY = 'maasuraksha_pending_qr_token';

export function savePendingQrToken(token: string): void {
  try {
    sessionStorage.setItem(PENDING_QR_TOKEN_KEY, token);
  } catch {
    // Storage unavailable — the scan simply can't survive a login redirect.
  }
}

export function getPendingQrToken(): string | null {
  try {
    const token = sessionStorage.getItem(PENDING_QR_TOKEN_KEY);
    return token && isValidQrToken(token) ? token : null;
  } catch {
    return null;
  }
}

export function clearPendingQrToken(): void {
  try {
    sessionStorage.removeItem(PENDING_QR_TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}

// --- Lookup ------------------------------------------------------------------

export async function scanQrToken(token: string): Promise<QrScanPatient> {
  const authToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!authToken) {
    throw new QrScanError('Sign in with your real account to look up a patient QR.', 401);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/qr/scan`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
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

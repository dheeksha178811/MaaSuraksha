// ---------------------------------------------------------------------------
// Real backend client for the QR consent flow (/api/consent/*).
//   Doctor/hospital: ask for extra sections after a QR scan, poll the status,
//   and fetch the approved sections. Mother: list requests, approve or deny.
// All access decisions (approval, expiry, ownership) are made server-side on
// every call; this client only reflects what the backend returns. No mock
// fallback — it needs the real JWT. Errors keep the HTTP status so the UI can
// tell "expired" (403) from "not yours" (404).
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';

export class ConsentError extends AuthApiError {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export type ConsentSection = 'reports' | 'appointments' | 'medications' | 'vaccinations' | 'growth';
export type ConsentStatus = 'pending' | 'approved' | 'denied' | 'expired';

export const CONSENT_SECTION_OPTIONS: { id: ConsentSection; label: string; description: string }[] = [
  { id: 'reports', label: 'Reports & Documents', description: 'Scan, lab and prescription records' },
  { id: 'appointments', label: 'Appointments / Care History', description: 'Past and upcoming visits' },
  { id: 'medications', label: 'Medications', description: 'Prescribed medicines and instructions' },
  { id: 'vaccinations', label: 'Vaccinations', description: 'Doses given and due' },
  { id: 'growth', label: 'Growth & Milestones', description: 'Measurements and developmental milestones' },
];

export const sectionLabel = (id: ConsentSection) => CONSENT_SECTION_OPTIONS.find((s) => s.id === id)?.label ?? id;

export interface ConsentRequest {
  id: string;
  requesterType: 'doctor' | 'hospital';
  requesterName: string | null;
  sections: ConsentSection[];
  status: ConsentStatus;
  requestedAt: string;
  respondedAt: string | null;
  accessExpiresAt: string | null;
  serverNow: string;
}

export interface ApprovedReport {
  id: string; name: string; category: string | null; date: string | null; status: string | null;
  description: string | null; fileType: string | null; fileSize: string | null;
  doctorName: string | null; hospitalName: string | null;
}
export interface ApprovedAppointment {
  id: string; title: string | null; category: string | null; date: string | null; time: string | null;
  location: string | null; reason: string | null; status: string | null; notes: string | null;
  doctorName: string | null; hospitalName: string | null;
}
export interface ApprovedMedication {
  id: string; name: string; dosage: string | null; frequency: string | null; timing: string | null;
  startDate: string | null; endDate: string | null; status: string | null;
  instructions: string | null; caution: string | null; doctorName: string | null;
}
export interface ApprovedVaccination {
  id: string; vaccineName: string | null; doseLabel: string | null; recipientType: string | null;
  recommendedDate: string | null; givenDate: string | null; status: string | null;
  location: string | null; administeredBy: string | null; notes: string | null;
}
export interface ApprovedMeasurement {
  id: string; recipientType: string | null; measuredOn: string | null; weightKg: string | null;
  heightCm: string | null; headCircumferenceCm: string | null; context: string | null; notes: string | null;
}
export interface ApprovedMilestone {
  id: string; recipientType: string | null; category: string | null; title: string | null;
  description: string | null; targetAgeRange: string | null; status: string | null;
  achievedDate: string | null; notes: string | null;
}

// Only the sections the mother approved are ever present.
export interface ApprovedData {
  reports?: ApprovedReport[];
  appointments?: ApprovedAppointment[];
  medications?: ApprovedMedication[];
  vaccinations?: ApprovedVaccination[];
  growth?: { measurements: ApprovedMeasurement[]; milestones: ApprovedMilestone[] };
}

async function request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<Record<string, any>> {
  const authToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!authToken) {
    throw new ConsentError('Sign in with your real account to continue.', 401);
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/consent${path}`, {
      method,
      headers: { Authorization: `Bearer ${authToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ConsentError(typeof json.message === 'string' ? json.message : `Request failed with status ${res.status}.`, res.status);
  }
  return json;
}

// --- Doctor / hospital --------------------------------------------------------

export async function createConsentRequest(qrToken: string, sections: ConsentSection[]): Promise<ConsentRequest> {
  return (await request('POST', '/requests', { token: qrToken, sections })).request;
}

// Latest request this clinician made for the mother behind the QR (or null).
export async function getCurrentConsentRequest(qrToken: string): Promise<ConsentRequest | null> {
  return (await request('POST', '/requests/current', { token: qrToken })).request ?? null;
}

export async function getConsentRequestStatus(requestId: string): Promise<ConsentRequest> {
  return (await request('GET', `/requests/${requestId}`)).request;
}

export async function getConsentedData(requestId: string): Promise<{ request: ConsentRequest; data: ApprovedData }> {
  const json = await request('GET', `/requests/${requestId}/data`);
  return { request: json.request, data: json.data };
}

// --- Mother --------------------------------------------------------------------

export async function listMyAccessRequests(): Promise<ConsentRequest[]> {
  return (await request('GET', '/mother/requests')).requests;
}

export async function approveAccessRequest(requestId: string): Promise<ConsentRequest> {
  return (await request('POST', `/mother/requests/${requestId}/approve`)).request;
}

export async function denyAccessRequest(requestId: string): Promise<ConsentRequest> {
  return (await request('POST', `/mother/requests/${requestId}/deny`)).request;
}

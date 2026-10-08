// ---------------------------------------------------------------------------
// Real backend client for hospital referrals (/api/referrals/*).
// All authorization (who may see or act on a referral, valid status
// transitions, same-hospital rule) is enforced by the backend on every call;
// this client only sends what the API accepts and reflects what it returns.
// It never sends from_hospital_id, referring_doctor_id or status — the sender
// side is derived server-side from the patient's active care assignment.
// Needs the real JWT; there is no mock fallback. Errors keep the HTTP status.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import { ReferralPriority, ReferralStatus } from '@/types';

export class ReferralApiError extends AuthApiError {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface Referral {
  id: string;
  // Relative to the signed-in account: sender (we referred), receiver
  // (referred to us) or patient. Display hint only — the backend decides.
  viewerRole: 'sender' | 'receiver' | 'patient';
  patient: { name: string; maaSurakshaId: string | null; stage: string | null; bloodGroup: string | null };
  fromHospital: string;
  toHospital: string;
  referringDoctor: string;
  reason: string | null;
  priority: ReferralPriority;
  clinicalSummary: string;
  status: ReferralStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  inTransitAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface ReferralDestination {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export interface CreateReferralInput {
  motherId: string;
  toHospitalId: string;
  reason: string;
  priority: ReferralPriority;
  clinicalSummary: string;
}

async function request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<Record<string, any>> {
  const authToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!authToken) {
    throw new ReferralApiError('Sign in with your real account to manage referrals.', 401);
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/referrals${path}`, {
      method,
      headers: { Authorization: `Bearer ${authToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(json.errors) && json.errors.length ? ` ${json.errors.join(' ')}` : '';
    const message = typeof json.message === 'string' ? json.message + detail : `Request failed with status ${res.status}.`;
    throw new ReferralApiError(message, res.status);
  }
  return json;
}

export async function listReferrals(): Promise<Referral[]> {
  return (await request('GET', '')).referrals;
}

export async function getReferral(id: string): Promise<Referral> {
  return (await request('GET', `/${id}`)).referral;
}

export async function listReferralDestinations(): Promise<ReferralDestination[]> {
  return (await request('GET', '/hospitals')).hospitals;
}

export async function createReferral(input: CreateReferralInput): Promise<Referral> {
  return (
    await request('POST', '', {
      mother_id: input.motherId,
      to_hospital_id: input.toHospitalId,
      reason: input.reason,
      priority: input.priority,
      clinical_summary: input.clinicalSummary,
    })
  ).referral;
}

export const acceptReferral = async (id: string): Promise<Referral> => (await request('POST', `/${id}/accept`)).referral;
export const rejectReferral = async (id: string, rejectionReason: string): Promise<Referral> =>
  (await request('POST', `/${id}/reject`, { rejection_reason: rejectionReason })).referral;
export const markReferralInTransit = async (id: string): Promise<Referral> => (await request('POST', `/${id}/in-transit`)).referral;
export const completeReferral = async (id: string): Promise<Referral> => (await request('POST', `/${id}/complete`)).referral;
export const cancelReferral = async (id: string): Promise<Referral> => (await request('POST', `/${id}/cancel`)).referral;

// --- Action buttons -----------------------------------------------------------
// Mirrors the backend's rules so the page only offers actions that can work;
// it is a convenience, not a gate — the backend re-checks party and status.

export type ReferralActionKey = 'accept' | 'reject' | 'in-transit' | 'complete' | 'cancel';

export interface ReferralAction {
  key: ReferralActionKey;
  label: string;
  tone: 'default' | 'danger';
}

export function getAvailableReferralActions(referral: Pick<Referral, 'status' | 'viewerRole'>): ReferralAction[] {
  const { status, viewerRole } = referral;
  const actions: ReferralAction[] = [];
  if (viewerRole === 'receiver') {
    if (status === 'PENDING') {
      actions.push({ key: 'accept', label: 'Accept', tone: 'default' }, { key: 'reject', label: 'Reject', tone: 'danger' });
    }
    if (status === 'ACCEPTED') actions.push({ key: 'in-transit', label: 'Mark In Transit', tone: 'default' });
    if (status === 'IN_TRANSIT') actions.push({ key: 'complete', label: 'Mark Completed', tone: 'default' });
  }
  if (viewerRole === 'sender') {
    if (status === 'ACCEPTED') actions.push({ key: 'in-transit', label: 'Mark In Transit', tone: 'default' });
    if (status === 'PENDING' || status === 'ACCEPTED') actions.push({ key: 'cancel', label: 'Cancel', tone: 'danger' });
  }
  return actions;
}

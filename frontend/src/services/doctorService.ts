// ---------------------------------------------------------------------------
// Real backend client for the doctor-domain APIs — Phase 6 Part 5.
//
// Unlike the mother domain, there is no dedicated /api/doctor/* route group:
// the only real backend surface for a doctor account is the generic,
// role-aware self-service endpoints already used by every role (GET/PATCH
// /auth/me, GET/PATCH /auth/me/settings — see authRoutes.ts and
// settingsService.ts's per-role branches). This client wraps exactly that
// surface for the doctor role, following the same fetch/token/mapping
// pattern as motherService.ts. Patients, appointments, messages,
// notifications, care plans, and reports have no backend API yet and stay
// on mock data — see PROJECT_STATE.md / this phase's report.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import {
  DoctorAvailabilityPreferences,
  DoctorCommunicationPreferences,
  DoctorNotificationPreferences,
  DoctorPrivacySecurityPreferences,
  DoctorProfileFormValues,
  DoctorWorkspacePreferences,
} from '@/types';
import { defaultDoctorSettings } from '@/data/doctorSettingsMockData';

export class NotAuthenticatedError extends AuthApiError {}

function getToken(): string {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    throw new NotAuthenticatedError('Sign in with your real account to view this data.');
  }
  return token;
}

async function authedFetch(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.message === 'string' ? body.message : `Request failed with status ${res.status}.`;
    throw new AuthApiError(message);
  }
  return body;
}

const get = (path: string) => authedFetch(path);
const patch = (path: string, body?: unknown) => authedFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

// --- Profile -----------------------------------------------------------------

export interface DoctorProfileSummary extends DoctorProfileFormValues {
  name: string;
  specialization: string;
  qualification: string;
  hospitalName: string;
  experienceYears: number;
  availableDays: string[];
}

interface DoctorProfileRowShape {
  specialization: string | null;
  qualification: string | null;
  hospital_name: string | null;
  experience_years: number | null;
  available_days: string[] | null;
  location: string | null;
  bio: string | null;
}

export async function getMyProfile(): Promise<DoctorProfileSummary> {
  const body = await get('/auth/me');
  const user = body.user as { name: string; phone: string | null; email: string; profile?: DoctorProfileRowShape };
  const profile = user.profile;
  return {
    name: user.name,
    phone: user.phone ?? '',
    email: user.email,
    specialization: profile?.specialization ?? '',
    qualification: profile?.qualification ?? '',
    hospitalName: profile?.hospital_name ?? '',
    experienceYears: profile?.experience_years ?? 0,
    availableDays: profile?.available_days ?? [],
    location: profile?.location ?? '',
    bio: profile?.bio ?? '',
  };
}

// updateCurrentUser only writes phone/email on `users` and, for a doctor,
// only location/bio on doctor_profiles (see profileService.ts
// updateDoctorProfileRow) — specialization/qualification/hospitalId are
// credentialing fields with no write path here, matching what
// EditDoctorProfileModal already tells the user.
export async function updateProfile(input: DoctorProfileFormValues): Promise<void> {
  await patch('/auth/me', {
    phone: input.phone,
    email: input.email,
    profile: { location: input.location, bio: input.bio },
  });
}

// --- Settings ------------------------------------------------------------------

export interface DoctorSettingsPatch {
  notifications?: DoctorNotificationPreferences;
  communication?: DoctorCommunicationPreferences;
  workspace?: DoctorWorkspacePreferences;
  availability?: DoctorAvailabilityPreferences;
  privacy?: DoctorPrivacySecurityPreferences;
}

interface DoctorSettingsRowShape {
  notifications?: Partial<DoctorNotificationPreferences> | null;
  communication?: Partial<DoctorCommunicationPreferences> | null;
  workspace?: Partial<DoctorWorkspacePreferences> | null;
  availability?: Partial<DoctorAvailabilityPreferences> | null;
  privacy?: Partial<DoctorPrivacySecurityPreferences> | null;
}

// A doctor account with no settings row yet is normal (no *_settings row is
// created at registration — see settingsService.ts) — every missing section
// falls back to this app's existing mock defaults, not an invented value.
function mergeSettings(row: DoctorSettingsRowShape | null) {
  return {
    doctorId: defaultDoctorSettings.doctorId,
    notifications: { ...defaultDoctorSettings.notifications, ...(row?.notifications ?? {}) },
    communication: { ...defaultDoctorSettings.communication, ...(row?.communication ?? {}) },
    workspace: { ...defaultDoctorSettings.workspace, ...(row?.workspace ?? {}) },
    availability: { ...defaultDoctorSettings.availability, ...(row?.availability ?? {}) },
    privacy: { ...defaultDoctorSettings.privacy, ...(row?.privacy ?? {}) },
  };
}

export async function getSettings() {
  const body = await get('/auth/me/settings');
  return mergeSettings(body.settings as DoctorSettingsRowShape | null);
}

// Each JSON column is replaced wholesale server-side (no field-level merge),
// so callers must pass the complete section object for anything they're
// changing, not just the changed key — same contract as motherService.ts.
export async function updateSettings(patch_: DoctorSettingsPatch) {
  const body = await patch('/auth/me/settings', patch_);
  return mergeSettings(body.settings as DoctorSettingsRowShape | null);
}

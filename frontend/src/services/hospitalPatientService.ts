// ---------------------------------------------------------------------------
// Real backend client for the hospital's own patient roster
// (/api/hospital/patients). The backend derives the hospital from the JWT and
// returns only mothers with an active care assignment to it; this client
// never sends a hospital id. Replaces the mock roster on the Hospital
// Patients / Patient Detail pages. (Beds, deliveries, etc. in
// hospitalService.ts are still demo data.)
//
// `id` is the patient_care_records id (used in /hospital/patients/:id);
// `motherId` is the mother's real account id — what POST /api/referrals needs.
//
// The roster has no admissions/ward data yet, so status and care type are
// derived from the care record's stage: ANTENATAL -> Outpatient/Antenatal,
// POSTNATAL -> Postpartum/Postnatal, otherwise Outpatient/General.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import {
  DeliveryRecord,
  HospitalActivityItem,
  HospitalCareType,
  NeonatalRecord,
  PatientCareStatus,
  PatientRiskLevel,
  ReferralStatus,
} from '@/types';

export interface HospitalRosterPatient {
  id: string;
  motherId: string;
  motherName: string;
  age: number | null;
  doctorName: string;
  status: PatientCareStatus;
  careType: HospitalCareType;
  riskLevel: PatientRiskLevel;
  admissionDate: string; // registered_on
}

export interface HospitalRosterPatientDetail extends HospitalRosterPatient {
  facilityName: string;
  referrals: { id: string; toHospitalName: string; status: ReferralStatus; reason: string | null }[];
  // No real delivery / neonatal / activity data exists yet (those tables are
  // unpopulated and have no API), so the detail page shows its empty states.
  deliveries: DeliveryRecord[];
  neonatalRecords: NeonatalRecord[];
  activity: HospitalActivityItem[];
}

interface PatientRowShape {
  id: string;
  motherId: string;
  motherName: string;
  age: number | null;
  doctorName: string;
  stage: string | null;
  riskLevel: string | null;
  admissionDate: string;
}

function toRosterPatient(row: PatientRowShape): HospitalRosterPatient {
  const postnatal = row.stage === 'POSTNATAL';
  return {
    id: row.id,
    motherId: row.motherId,
    motherName: row.motherName,
    age: row.age,
    doctorName: row.doctorName,
    status: postnatal ? 'POSTPARTUM' : 'OUTPATIENT',
    careType: postnatal ? 'POSTNATAL' : row.stage === 'ANTENATAL' ? 'ANTENATAL' : 'GENERAL',
    riskLevel: (row.riskLevel as PatientRiskLevel) ?? 'LOW',
    admissionDate: row.admissionDate,
  };
}

export class HospitalPatientError extends AuthApiError {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function get(path: string): Promise<Record<string, any>> {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) throw new HospitalPatientError('Sign in with your real account to view patients.', 401);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/hospital${path}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new HospitalPatientError(typeof body.message === 'string' ? body.message : `Request failed with status ${res.status}.`, res.status);
  }
  return body;
}

export interface RosterFilters {
  status?: PatientCareStatus;
  riskLevel?: PatientRiskLevel;
  careType?: HospitalCareType;
  search?: string;
}

// The API returns this hospital's whole roster; the page's existing filters
// narrow it here. (Filtering is display-only — isolation is enforced server-side.)
export async function getHospitalRoster(filters: RosterFilters = {}): Promise<HospitalRosterPatient[]> {
  let patients = ((await get('/patients')).patients as PatientRowShape[]).map(toRosterPatient);
  if (filters.status) patients = patients.filter((p) => p.status === filters.status);
  if (filters.riskLevel) patients = patients.filter((p) => p.riskLevel === filters.riskLevel);
  if (filters.careType) patients = patients.filter((p) => p.careType === filters.careType);
  const q = filters.search?.trim().toLowerCase();
  if (q) patients = patients.filter((p) => p.motherName.toLowerCase().includes(q));
  return patients;
}

// undefined when the patient is not under this hospital (404).
export async function getHospitalRosterPatient(id: string): Promise<HospitalRosterPatientDetail | undefined> {
  try {
    const row = (await get(`/patients/${id}`)).patient as PatientRowShape & Pick<HospitalRosterPatientDetail, 'facilityName' | 'referrals'>;
    return { ...toRosterPatient(row), facilityName: row.facilityName, referrals: row.referrals, deliveries: [], neonatalRecords: [], activity: [] };
  } catch (e) {
    if (e instanceof HospitalPatientError && e.status === 404) return undefined;
    throw e;
  }
}

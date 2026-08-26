// ---------------------------------------------------------------------------
// Real backend client for the doctor-domain APIs — Phase 6 Parts 5-12.
//
// Doctor self-service (profile/settings) goes through the generic,
// role-aware endpoints every role shares (GET/PATCH /auth/me, GET/PATCH
// /auth/me/settings). Patient roster/detail, appointments, care plans,
// consultation notes, the doctor's own hospital, and reports (documents) go
// through the dedicated /api/doctor/* route group (Parts 6-12), reusing the
// appointments/care_recommendations/consultation_notes/hospital_profiles/
// documents tables Mother's/this domain's own write paths already populate.
// Report upload, messages, and notifications still have no backend API and
// stay on mock data — see PROJECT_STATE.md / this phase's report.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import {
  AssignedPatient,
  CareRecommendation,
  ChildProfile,
  ConsultationNote,
  DoctorAppointment,
  DoctorAppointmentStatus,
  DoctorAppointmentType,
  DoctorAvailabilityPreferences,
  DoctorCommunicationPreferences,
  DoctorNotificationPreferences,
  DoctorPrivacySecurityPreferences,
  DoctorProfileFormValues,
  DoctorWorkspacePreferences,
  PatientRiskLevel,
  PatientStage,
  PatientStatus,
  RecommendationType,
  Report,
  ReportCategory,
  ReportStatus,
} from '@/types';
import { defaultDoctorSettings } from '@/data/doctorSettingsMockData';

export class NotAuthenticatedError extends AuthApiError {}

function getToken(): string {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
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

// --- Patients (My Patients roster) --------------------------------------------

interface AssignedPatientRowShape {
  patient_id: string;
  mother_id: string;
  doctor_id: string;
  hospital_id: string;
  child_id: string | null;
  name: string;
  phone: string | null;
  age: number | null;
  blood_group: string | null;
  location: string | null;
  stage: string | null;
  status: string | null;
  risk_level: string | null;
  pregnancy_week: number | null;
  expected_delivery_date: string | null;
  gravida: string | null;
  anc_visits_completed: number | null;
  anc_visits_planned: number | null;
  high_risk_factors: string[] | null;
  delivery_date: string | null;
  delivery_type: string | null;
  postpartum_weeks: number | null;
  recovery_status: string | null;
  breastfeeding_status: string | null;
  last_visit_date: string | null;
  registered_on: string;
}

function toAssignedPatient(row: AssignedPatientRowShape): AssignedPatient {
  const stage = (row.stage as PatientStage) ?? 'ANTENATAL';
  return {
    patientId: row.patient_id,
    motherId: row.mother_id,
    doctorId: row.doctor_id,
    hospitalId: row.hospital_id,
    childId: row.child_id ?? undefined,
    name: row.name,
    age: row.age ?? 0,
    phone: row.phone ?? '',
    bloodGroup: row.blood_group ?? '',
    location: row.location ?? '',
    stage,
    status: (row.status as PatientStatus) ?? 'NEW',
    riskLevel: (row.risk_level as PatientRiskLevel) ?? 'LOW',
    antenatal:
      stage === 'ANTENATAL'
        ? {
            pregnancyWeek: row.pregnancy_week ?? 0,
            expectedDeliveryDate: row.expected_delivery_date ?? '',
            gravida: row.gravida ?? '',
            ancVisitsCompleted: row.anc_visits_completed ?? 0,
            ancVisitsPlanned: row.anc_visits_planned ?? 0,
            highRiskFactors: row.high_risk_factors ?? [],
          }
        : undefined,
    postnatal:
      stage === 'POSTNATAL'
        ? {
            deliveryDate: row.delivery_date ?? '',
            deliveryType: (row.delivery_type as 'Normal' | 'C-Section' | 'Assisted') ?? 'Normal',
            postpartumWeeks: row.postpartum_weeks ?? 0,
            recoveryStatus: row.recovery_status ?? '',
            breastfeedingStatus: row.breastfeeding_status ?? '',
          }
        : undefined,
    lastVisitDate: row.last_visit_date ?? undefined,
    registeredOn: row.registered_on,
  };
}

export async function getMyPatients(): Promise<AssignedPatient[]> {
  const body = await get('/doctor/patients');
  return ((body.patients as AssignedPatientRowShape[]) ?? []).map(toAssignedPatient);
}

// --- Single patient detail (Patient Care Workspace) ---------------------------

interface AssignedPatientDetailRowShape extends AssignedPatientRowShape {
  child_name: string | null;
  child_gender: string | null;
  child_date_of_birth: string | null;
  child_birth_weight_kg: string | null;
  child_current_weight_kg: string | null;
  child_blood_group: string | null;
  child_birth_hospital_name: string | null;
}

export interface DoctorPatientDetail extends AssignedPatient {
  // Real child_profiles data resolved via patient_care_records.child_id —
  // absent (not fabricated) when the assignment has no child on file yet
  // (e.g. still antenatal) or the schema value itself is null.
  child?: ChildProfile;
}

function ageDisplayFromDob(dob: string | null): string {
  if (!dob) return 'Unknown age';
  const days = Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `${weeks} week${weeks === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'}`;
}

function toDoctorPatientDetail(row: AssignedPatientDetailRowShape): DoctorPatientDetail {
  const patient = toAssignedPatient(row);
  const child: ChildProfile | undefined = row.child_name
    ? {
        id: patient.childId ?? '',
        motherId: patient.motherId,
        name: row.child_name,
        gender: (row.child_gender as ChildProfile['gender']) ?? 'boy',
        dateOfBirth: row.child_date_of_birth ?? '',
        ageDisplay: ageDisplayFromDob(row.child_date_of_birth),
        birthWeightKg: row.child_birth_weight_kg != null ? Number(row.child_birth_weight_kg) : 0,
        currentWeightKg: row.child_current_weight_kg != null ? Number(row.child_current_weight_kg) : 0,
        bloodGroup: row.child_blood_group ?? '',
        birthHospital: row.child_birth_hospital_name ?? '',
      }
    : undefined;
  return { ...patient, child };
}

// Throws (via authedFetch's AuthApiError) on a 404 — a patient id that
// doesn't exist, or exists but isn't assigned to the signed-in doctor;
// the backend's WHERE pcr.doctor_id = $2 makes those indistinguishable by
// design, so the frontend doesn't need a separate ownership check.
export async function getPatientDetail(patientId: string): Promise<DoctorPatientDetail> {
  const body = await get(`/doctor/patients/${patientId}`);
  return toDoctorPatientDetail(body.patient as AssignedPatientDetailRowShape);
}

// --- Appointments ---------------------------------------------------------------

interface DoctorAppointmentRowShape {
  appointment_id: string;
  patient_id: string | null;
  patient_name: string;
  doctor_id: string;
  hospital_id: string;
  category: string | null;
  title: string | null;
  appt_date: string | null;
  appt_time: string | null;
  location: string | null;
  notes: string | null;
  status: string | null;
}

function toDoctorAppointment(row: DoctorAppointmentRowShape): DoctorAppointment {
  return {
    appointmentId: row.appointment_id,
    // Empty only if this appointment's (mother, doctor) pairing no longer
    // matches a currently-active patient_care_records assignment (e.g. the
    // mother has since been reassigned) — "Open Patient" degrades to the
    // existing not-found state rather than being fabricated.
    patientId: row.patient_id ?? '',
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    hospitalId: row.hospital_id,
    // title/category are the real values Mother's own appointment write path
    // already stored (see appointmentService.ts's CATEGORY_LABELS) — not
    // necessarily an exact match for DoctorAppointmentType's literal union,
    // but DoctorAppointmentsPage only ever renders this as plain text.
    type: (row.title || row.category || 'Appointment') as DoctorAppointmentType,
    date: row.appt_date ?? '',
    // Postgres TIME comes back as "HH:MM:SS" — trimmed to "HH:MM" for display.
    time: row.appt_time ? row.appt_time.slice(0, 5) : '',
    status: (row.status as DoctorAppointmentStatus) ?? 'upcoming',
    location: row.location ?? '',
    notes: row.notes ?? undefined,
  };
}

export async function getMyAppointments(): Promise<DoctorAppointment[]> {
  const body = await get('/doctor/appointments');
  return ((body.appointments as DoctorAppointmentRowShape[]) ?? []).map(toDoctorAppointment);
}

// --- Care plans (Recommendations) -----------------------------------------------

interface DoctorCareRecommendationRowShape {
  recommendation_id: string;
  patient_id: string;
  patient_name: string;
  child_id: string | null;
  child_name: string | null;
  doctor_id: string;
  type: string | null;
  title: string | null;
  description: string | null;
  rec_date: string | null;
  active: boolean;
}

function toCareRecommendation(row: DoctorCareRecommendationRowShape): CareRecommendation {
  return {
    recommendationId: row.recommendation_id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    type: (row.type as RecommendationType) ?? 'GENERAL',
    title: row.title ?? '',
    description: row.description ?? '',
    date: row.rec_date ?? '',
    active: row.active,
  };
}

export async function getMyCarePlans(): Promise<CareRecommendation[]> {
  const body = await get('/doctor/care-plans');
  return ((body.carePlans as DoctorCareRecommendationRowShape[]) ?? []).map(toCareRecommendation);
}

// --- Consultation notes ----------------------------------------------------------

interface DoctorConsultationNoteRowShape {
  note_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  note_date: string | null;
  title: string | null;
  note: string | null;
  visible_to_patient: boolean;
  created_at: string;
}

function toConsultationNote(row: DoctorConsultationNoteRowShape): ConsultationNote {
  return {
    noteId: row.note_id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    date: row.note_date ?? row.created_at,
    title: row.title ?? '',
    note: row.note ?? '',
  };
}

export async function getPatientConsultationNotes(patientId: string): Promise<ConsultationNote[]> {
  const body = await get(`/doctor/patients/${patientId}/consultation-notes`);
  return ((body.notes as DoctorConsultationNoteRowShape[]) ?? []).map(toConsultationNote);
}

// --- Hospital / practice information ---------------------------------------------

export interface DoctorHospitalSummary {
  hospitalId: string;
  name: string;
  facilityType: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  contactNumber: string;
  totalBeds: number;
  neonatalICUAvailable: boolean;
  status: string;
  tagline: string;
  establishedYear: number | null;
  accreditations: string[];
  visitingHours: string;
  emergencyContactNumber: string;
  ambulanceAvailable: boolean;
}

interface DoctorHospitalRowShape {
  hospital_id: string;
  facility_name: string;
  facility_type: string | null;
  license_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  contact_number: string | null;
  total_beds: number;
  neonatal_icu_available: boolean;
  status: string;
  tagline: string | null;
  established_year: number | null;
  accreditations: string[] | null;
  visiting_hours: string | null;
  emergency_contact_number: string | null;
  ambulance_available: boolean;
}

function toDoctorHospital(row: DoctorHospitalRowShape): DoctorHospitalSummary {
  return {
    hospitalId: row.hospital_id,
    name: row.facility_name,
    facilityType: row.facility_type ?? '',
    licenseNumber: row.license_number ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    postalCode: row.postal_code ?? '',
    contactNumber: row.contact_number ?? '',
    totalBeds: row.total_beds,
    neonatalICUAvailable: row.neonatal_icu_available,
    status: row.status,
    tagline: row.tagline ?? '',
    establishedYear: row.established_year,
    accreditations: row.accreditations ?? [],
    visitingHours: row.visiting_hours ?? '',
    emergencyContactNumber: row.emergency_contact_number ?? '',
    ambulanceAvailable: row.ambulance_available,
  };
}

// Throws (via authedFetch's AuthApiError) on a 404 — a doctor account with no
// hospital_id set, or one pointing at a hospital_profiles row that doesn't
// exist. DoctorHospitalPage surfaces that through its existing AsyncStateView
// error state rather than a fabricated hospital.
export async function getMyHospital(): Promise<DoctorHospitalSummary> {
  const body = await get('/doctor/hospital');
  return toDoctorHospital(body.hospital as DoctorHospitalRowShape);
}

// --- Reports (documents) -----------------------------------------------------------

interface DoctorReportRowShape {
  document_id: string;
  patient_id: string;
  patient_name: string;
  child_id: string | null;
  child_name: string | null;
  name: string;
  category: string | null;
  doc_date: string | null;
  status: string | null;
  description: string | null;
  file_size: string | null;
  file_type: string | null;
  file_url: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
}

function toReport(row: DoctorReportRowShape): Report {
  return {
    id: row.document_id,
    name: row.name,
    category: (row.category as ReportCategory) ?? 'OTHER',
    date: row.doc_date ?? '',
    doctor: row.doctor_name ?? '',
    hospital: row.hospital_name ?? '',
    status: (row.status as ReportStatus) ?? 'PENDING',
    description: row.description ?? undefined,
    fileSize: row.file_size ?? undefined,
    fileType: row.file_type ?? undefined,
    patientId: row.patient_id,
  };
}

// No upload producer exists yet (Part 12 is read-only), so an empty array
// here is the correct, expected state — not treated as an error.
export async function getMyReports(): Promise<Report[]> {
  const body = await get('/doctor/reports');
  return ((body.reports as DoctorReportRowShape[]) ?? []).map(toReport);
}

import { pool } from '../config/db';

// patient_care_records is the existing doctor <-> mother/child assignment
// table (migration 001) — one active row per mother, doctor_id + hospital_id
// + optional child_id, plus the antenatal/postnatal clinical fields the
// mock AssignedPatient shape already models. No new table/column is needed:
// this is a read-only join onto data that already exists.
export interface AssignedPatientRow {
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

const COLUMNS = `
  pcr.id AS patient_id, pcr.mother_id, pcr.doctor_id, pcr.hospital_id, pcr.child_id,
  u.name, u.phone, mp.age, mp.blood_group, mp.location,
  pcr.stage, pcr.status, pcr.risk_level,
  pcr.pregnancy_week, pcr.expected_delivery_date, pcr.gravida,
  pcr.anc_visits_completed, pcr.anc_visits_planned, pcr.high_risk_factors,
  pcr.delivery_date, pcr.delivery_type, pcr.postpartum_weeks,
  pcr.recovery_status, pcr.breastfeeding_status,
  pcr.last_visit_date, pcr.registered_on
`;

/**
 * A doctor's current roster: every mother with an active patient_care_records
 * assignment to this doctor. Name/phone come from users, age/blood
 * group/location from mother_profiles — same join shape as
 * appointmentService.ts's doctor/hospital name resolution (Phase 6 Part 4),
 * just walked from the doctor's side instead of the mother's.
 */
export async function listMyPatients(doctorId: string): Promise<AssignedPatientRow[]> {
  const result = await pool.query<AssignedPatientRow>(
    `SELECT ${COLUMNS}
     FROM patient_care_records pcr
     JOIN users u ON u.id = pcr.mother_id
     JOIN mother_profiles mp ON mp.id = pcr.mother_id
     WHERE pcr.doctor_id = $1 AND pcr.is_active = true
     ORDER BY u.name ASC`,
    [doctorId]
  );
  return result.rows;
}

export interface AssignedPatientDetailRow extends AssignedPatientRow {
  child_name: string | null;
  child_gender: string | null;
  child_date_of_birth: string | null;
  child_birth_weight_kg: string | null;
  child_current_weight_kg: string | null;
  child_blood_group: string | null;
  child_birth_hospital_name: string | null;
}

/**
 * A single roster entry, by its patient_care_records id, plus real child
 * identity (child_profiles, via patient_care_records.child_id — the same
 * relationship listMyPatients already scopes by). `doctor_id = $2` in the
 * WHERE clause is the ownership check: a patient assigned to a different
 * doctor simply doesn't match and this returns null, same as "not found" —
 * no separate authorization check needed on top of it.
 */
export async function getPatientByIdForDoctor(
  doctorId: string,
  patientId: string
): Promise<AssignedPatientDetailRow | null> {
  const result = await pool.query<AssignedPatientDetailRow>(
    `SELECT ${COLUMNS},
       cp.name AS child_name, cp.gender AS child_gender, cp.date_of_birth AS child_date_of_birth,
       cp.birth_weight_kg AS child_birth_weight_kg, cp.current_weight_kg AS child_current_weight_kg,
       cp.blood_group AS child_blood_group,
       (SELECT facility_name FROM hospital_profiles WHERE id = cp.birth_hospital_id) AS child_birth_hospital_name
     FROM patient_care_records pcr
     JOIN users u ON u.id = pcr.mother_id
     JOIN mother_profiles mp ON mp.id = pcr.mother_id
     LEFT JOIN child_profiles cp ON cp.id = pcr.child_id
     WHERE pcr.id = $1 AND pcr.doctor_id = $2 AND pcr.is_active = true`,
    [patientId, doctorId]
  );
  return result.rows[0] ?? null;
}

export interface DoctorAppointmentRow {
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

/**
 * A doctor's own appointments (the `appointments` table — migration 002 —
 * already populated by Mother's real appointment APIs; see
 * backend/src/services/appointmentService.ts). `appointments` has no direct
 * FK to patient_care_records, so `patient_id` (the roster id
 * DoctorAppointmentsPage's "Open Patient" link navigates by — see
 * getPatientByIdForDoctor above) is resolved via the same
 * (mother_id, doctor_id) pairing Mother's own requestMyAppointment() uses to
 * derive doctor_id/hospital_id from the mother's active care assignment —
 * not a new relationship. LEFT JOIN (not JOIN) so an appointment is never
 * silently dropped from the list if that pairing no longer resolves to a
 * currently-active assignment; patient_id is just null in that case.
 */
export async function listMyAppointments(doctorId: string): Promise<DoctorAppointmentRow[]> {
  const result = await pool.query<DoctorAppointmentRow>(
    `SELECT
       a.id AS appointment_id, pcr.id AS patient_id, u.name AS patient_name,
       a.doctor_id, a.hospital_id, a.category, a.title,
       a.appt_date, a.appt_time, a.location, a.notes, a.status
     FROM appointments a
     JOIN users u ON u.id = a.mother_id
     LEFT JOIN patient_care_records pcr
       ON pcr.mother_id = a.mother_id AND pcr.doctor_id = a.doctor_id AND pcr.is_active = true
     WHERE a.doctor_id = $1
     ORDER BY a.appt_date ASC, a.appt_time ASC`,
    [doctorId]
  );
  return result.rows;
}

export interface DoctorCareRecommendationRow {
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

/**
 * A doctor's own care_recommendations rows (migration 002), scoped directly
 * by care_recommendations.doctor_id — the same column patient_care_records
 * uses, populated when a recommendation is created against a
 * patient_care_records row this doctor owns. JOIN (not LEFT JOIN) on
 * patient_care_records/users is safe here: care_recommendations.
 * patient_care_record_id is NOT NULL and ON DELETE CASCADE, so a
 * recommendation row can't outlive its patient_care_records parent.
 */
export async function listMyCarePlans(doctorId: string): Promise<DoctorCareRecommendationRow[]> {
  const result = await pool.query<DoctorCareRecommendationRow>(
    `SELECT
       cr.id AS recommendation_id, pcr.id AS patient_id, u.name AS patient_name,
       pcr.child_id, cp.name AS child_name,
       cr.doctor_id, cr.type, cr.title, cr.description, cr.rec_date, cr.active
     FROM care_recommendations cr
     JOIN patient_care_records pcr ON pcr.id = cr.patient_care_record_id
     JOIN users u ON u.id = pcr.mother_id
     LEFT JOIN child_profiles cp ON cp.id = pcr.child_id
     WHERE cr.doctor_id = $1
     ORDER BY cr.rec_date DESC NULLS LAST, cr.created_at DESC`,
    [doctorId]
  );
  return result.rows;
}

export interface DoctorConsultationNoteRow {
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

/**
 * A patient's consultation_notes (migration 002), gated by the same
 * ownership check getPatientByIdForDoctor uses: patientId (a
 * patient_care_records id) must resolve to a currently-active assignment for
 * this doctor before any notes are read. Returns null (not []) when that
 * check fails, so the controller can 404 the same way getPatientByIdForDoctor
 * does instead of silently returning an empty notes list for someone else's
 * patient.
 */
export async function listConsultationNotesForPatient(
  doctorId: string,
  patientId: string
): Promise<DoctorConsultationNoteRow[] | null> {
  const ownership = await pool.query(
    `SELECT 1 FROM patient_care_records WHERE id = $1 AND doctor_id = $2 AND is_active = true`,
    [patientId, doctorId]
  );
  if (ownership.rowCount === 0) return null;

  const result = await pool.query<DoctorConsultationNoteRow>(
    `SELECT
       cn.id AS note_id, cn.patient_care_record_id AS patient_id, cn.doctor_id,
       cn.appointment_id, cn.note_date, cn.title, cn.note, cn.visible_to_patient, cn.created_at
     FROM consultation_notes cn
     WHERE cn.patient_care_record_id = $1
     ORDER BY cn.note_date DESC NULLS LAST, cn.created_at DESC`,
    [patientId]
  );
  return result.rows;
}

export interface DoctorHospitalRow {
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

/**
 * The authenticated doctor's practicing hospital, resolved via
 * doctor_profiles.hospital_id — the same FK getMyProfile (Phase 6 Part 5)
 * already reads doctor_profiles through — not a client-supplied hospital id.
 * Returns null when the doctor has no hospital_id set or the referenced
 * hospital_profiles row is missing, so the controller 404s instead of
 * inventing a hospital.
 */
export async function getHospitalForDoctor(doctorId: string): Promise<DoctorHospitalRow | null> {
  const result = await pool.query<DoctorHospitalRow>(
    `SELECT
       hp.id AS hospital_id, hp.facility_name, hp.facility_type, hp.license_number,
       hp.address, hp.city, hp.state, hp.postal_code, hp.contact_number,
       hp.total_beds, hp.neonatal_icu_available, hp.status, hp.tagline,
       hp.established_year, hp.accreditations, hp.visiting_hours,
       hp.emergency_contact_number, hp.ambulance_available
     FROM doctor_profiles dp
     JOIN hospital_profiles hp ON hp.id = dp.hospital_id
     WHERE dp.id = $1`,
    [doctorId]
  );
  return result.rows[0] ?? null;
}

export interface DoctorReportRow {
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

/**
 * A doctor's own documents (migration 002's `documents` table), scoped via
 * patient_care_records the same way care_recommendations is: documents has
 * no doctor_id column of its own, so ownership is verified by joining
 * through patient_care_record_id (NOT NULL-required here via inner JOIN) to
 * a patient_care_records row this doctor owns. A document with no
 * patient_care_record_id can't be attributed to any doctor and is correctly
 * excluded. No upload producer exists yet (Phase 6 Part 12 is read-only), so
 * an empty result is expected, not an error.
 */
export async function listMyReports(doctorId: string): Promise<DoctorReportRow[]> {
  const result = await pool.query<DoctorReportRow>(
    `SELECT
       d.id AS document_id, pcr.id AS patient_id, u.name AS patient_name,
       pcr.child_id, cp.name AS child_name,
       d.name, d.category, d.doc_date, d.status, d.description,
       d.file_size, d.file_type, d.file_url,
       doc_u.name AS doctor_name, hp.facility_name AS hospital_name
     FROM documents d
     JOIN patient_care_records pcr ON pcr.id = d.patient_care_record_id
     JOIN users u ON u.id = pcr.mother_id
     JOIN users doc_u ON doc_u.id = pcr.doctor_id
     LEFT JOIN child_profiles cp ON cp.id = pcr.child_id
     LEFT JOIN hospital_profiles hp ON hp.id = d.hospital_id
     WHERE pcr.doctor_id = $1
     ORDER BY d.doc_date DESC NULLS LAST, d.created_at DESC`,
    [doctorId]
  );
  return result.rows;
}

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

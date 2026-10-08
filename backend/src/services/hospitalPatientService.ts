import { pool } from '../config/db';
import { AuthError } from './authService';

// ---------------------------------------------------------------------------
// A hospital's patient roster: the mothers whose CURRENT active
// patient_care_records row names this hospital (hospital_id). The hospital id
// is always the authenticated hospital user's own id — never a parameter — so
// one hospital can never list or open another's patients. Only roster-level
// fields are returned (identity, assigned doctor, stage/risk); clinical
// records stay behind their own authorization / consent.
// ---------------------------------------------------------------------------

export interface HospitalPatientRow {
  id: string; // patient_care_records.id (the roster id used in /hospital/patients/:id)
  motherId: string;
  motherName: string;
  age: number | null;
  doctorName: string;
  stage: string | null;
  riskLevel: string | null;
  admissionDate: string;
}

const SELECT_PATIENT = `
  SELECT pcr.id, pcr.mother_id AS "motherId", mu.name AS "motherName", mp.age,
         du.name AS "doctorName", pcr.stage, pcr.risk_level AS "riskLevel",
         pcr.registered_on AS "admissionDate"
    FROM patient_care_records pcr
    JOIN users mu ON mu.id = pcr.mother_id
    JOIN mother_profiles mp ON mp.id = pcr.mother_id
    JOIN users du ON du.id = pcr.doctor_id
   WHERE pcr.hospital_id = $1 AND pcr.is_active = true`;

export async function listPatientsForHospital(hospitalId: string): Promise<HospitalPatientRow[]> {
  const result = await pool.query<HospitalPatientRow>(`${SELECT_PATIENT} ORDER BY mu.name ASC`, [hospitalId]);
  return result.rows;
}

export interface HospitalPatientDetailRow extends HospitalPatientRow {
  facilityName: string;
  referrals: { id: string; toHospitalName: string; status: string; reason: string | null }[];
}

/** Another hospital's patient is indistinguishable from a nonexistent one (404). */
export async function getPatientForHospital(hospitalId: string, patientId: string): Promise<HospitalPatientDetailRow> {
  const result = await pool.query<HospitalPatientRow>(`${SELECT_PATIENT} AND pcr.id = $2`, [hospitalId, patientId]);
  const patient = result.rows[0];
  if (!patient) {
    throw new AuthError('Patient not found for this account.', 404);
  }

  // Referrals this hospital sent or received for the mother — same visibility
  // rule as the referral API, read-only.
  const referrals = await pool.query(
    `SELECT r.id, th.facility_name AS "toHospitalName", r.status, r.reason
       FROM hospital_referrals r
       JOIN hospital_profiles th ON th.id = r.to_hospital_id
      WHERE r.mother_id = $2 AND (r.from_hospital_id = $1 OR r.to_hospital_id = $1)
      ORDER BY r.created_at DESC`,
    [hospitalId, patient.motherId]
  );
  const facility = await pool.query<{ facility_name: string }>('SELECT facility_name FROM hospital_profiles WHERE id = $1', [hospitalId]);
  return { ...patient, facilityName: facility.rows[0]?.facility_name ?? '', referrals: referrals.rows };
}

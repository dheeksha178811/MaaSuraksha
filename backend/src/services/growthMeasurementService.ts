import { pool } from '../config/db';
import { AuthError } from './authService';

export interface GrowthMeasurementInput {
  recipientType: 'MOTHER' | 'CHILD';
  childId?: string | null;
  measuredOn: string;
  weightKg?: number | null;
  heightCm?: number | null;
  headCircumferenceCm?: number | null;
  notes?: string | null;
}

export interface GrowthMeasurementRow {
  id: string;
  mother_id: string;
  child_id: string | null;
  doctor_id: string | null;
  hospital_id: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
  recipient_type: string;
  measured_on: string;
  weight_kg: string | null;
  height_cm: string | null;
  head_circumference_cm: string | null;
  context: string | null;
  notes: string | null;
  logged_by_mother: boolean;
  created_at: string;
}

const COLUMNS = `id, mother_id, child_id, doctor_id, hospital_id, recipient_type, measured_on,
  weight_kg, height_cm, head_circumference_cm, context, notes, logged_by_mother, created_at`;

// doctor_id/hospital_id are bare FKs — the mother frontend's MeasurementCard
// needs a display name, not an id, so reads resolve both via a correlated
// subquery rather than the frontend inventing one. Always null for a
// mother-logged home measurement (doctor_id/hospital_id are never set there),
// which is correct: there is no clinician to attribute it to.
const NAME_EXPRS = `(SELECT name FROM users WHERE id = growth_measurements.doctor_id) AS doctor_name,
  (SELECT facility_name FROM hospital_profiles WHERE id = growth_measurements.hospital_id) AS hospital_name`;

/**
 * growth_measurements.mother_id has a FK to mother_profiles(id), so an
 * orphan user (JWT role=mother but no mother_profiles row — see Part 1) can
 * never legitimately own a measurement row. Same 404 convention used
 * throughout Phase 4.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

async function assertChildOwnedByMother(childId: string, motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM child_profiles WHERE id = $1 AND mother_id = $2', [childId, motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Child not found for this account.', 404);
  }
}

export async function listMyGrowthMeasurements(motherId: string): Promise<GrowthMeasurementRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<GrowthMeasurementRow>(
    `SELECT ${COLUMNS}, ${NAME_EXPRS}
     FROM growth_measurements
     WHERE mother_id = $1
     ORDER BY measured_on ASC, created_at ASC`,
    [motherId]
  );
  return result.rows;
}

/**
 * Always inserts with logged_by_mother = true and doctor_id/hospital_id
 * left NULL — this endpoint is specifically the mother's own home-logging
 * path (LogMeasurementModal), distinct from a clinical visit entry, and
 * those two identifiers are never accepted from the client. `context` is a
 * real column but the frontend form never collects it, so it is left NULL
 * rather than given an invented value.
 */
export async function logMyGrowthMeasurement(
  motherId: string,
  input: GrowthMeasurementInput
): Promise<GrowthMeasurementRow> {
  await assertMotherProfileExists(motherId);

  if (input.recipientType === 'CHILD') {
    await assertChildOwnedByMother(input.childId as string, motherId);
  }

  const result = await pool.query<GrowthMeasurementRow>(
    `INSERT INTO growth_measurements
       (mother_id, child_id, recipient_type, measured_on, weight_kg, height_cm, head_circumference_cm, notes, logged_by_mother)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
     RETURNING ${COLUMNS}, ${NAME_EXPRS}`,
    [
      motherId,
      input.recipientType === 'CHILD' ? input.childId : null,
      input.recipientType,
      input.measuredOn,
      input.weightKg ?? null,
      input.heightCm ?? null,
      input.recipientType === 'CHILD' ? input.headCircumferenceCm ?? null : null,
      input.notes ?? null,
    ]
  );
  return result.rows[0];
}

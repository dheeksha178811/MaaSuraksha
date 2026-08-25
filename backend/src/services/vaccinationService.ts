import { pool } from '../config/db';
import { AuthError } from './authService';

export interface VaccinationRow {
  id: string;
  mother_id: string;
  child_id: string | null;
  doctor_id: string | null;
  hospital_id: string | null;
  recipient_type: string | null;
  vaccine_code: string | null;
  vaccine_name: string | null;
  dose_label: string | null;
  recommended_date: string | null;
  given_date: string | null;
  status: string | null;
  location: string | null;
  administered_by: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  created_at: string;
}

const COLUMNS = `id, mother_id, child_id, doctor_id, hospital_id, recipient_type, vaccine_code,
  dose_label, recommended_date, given_date, status, location, administered_by, notes,
  reminder_enabled, created_at`;

// vaccine_code is an internal catalog key, not a display name — the mother
// frontend's VaccinationCard renders a human vaccine name as its own record
// heading, so every read resolves it from vaccine_catalog via a correlated
// subquery (kept out of COLUMNS since that constant is also reused for the
// bare pre-update lookups in toggleMyVaccinationReminder, which don't need it).
const VACCINE_NAME_EXPR = `(SELECT name FROM vaccine_catalog WHERE code = vaccinations.vaccine_code) AS vaccine_name`;

/**
 * vaccinations.mother_id has a FK to mother_profiles(id), so an orphan user
 * (JWT role=mother but no mother_profiles row — see Part 1) can never
 * legitimately own a vaccination row. Same 404 convention used throughout
 * Phase 4/5.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

export async function listMyVaccinations(motherId: string): Promise<VaccinationRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<VaccinationRow>(
    `SELECT ${COLUMNS}, ${VACCINE_NAME_EXPR}
     FROM vaccinations
     WHERE mother_id = $1
     ORDER BY recommended_date ASC, created_at ASC`,
    [motherId]
  );
  return result.rows;
}

/**
 * Flips reminder_enabled on one of the mother's own vaccination records.
 * Ported directly from VaccinationDetailsModal.tsx's own
 * `showReminderToggle = ... && vaccination.status !== 'completed'` rule
 * (a completed dose has nothing left to remind about) rather than invented,
 * and the toggle itself mirrors both frontend handlers' exact
 * `reminderEnabled: !reminderEnabled` logic — never a client-supplied value.
 */
export async function toggleMyVaccinationReminder(motherId: string, vaccinationId: string): Promise<VaccinationRow> {
  const existing = await pool.query<VaccinationRow>(
    `SELECT ${COLUMNS} FROM vaccinations WHERE id = $1 AND mother_id = $2`,
    [vaccinationId, motherId]
  );
  const vaccination = existing.rows[0];
  if (!vaccination) {
    throw new AuthError('Vaccination record not found for this account.', 404);
  }

  if (vaccination.status === 'completed') {
    throw new AuthError('Reminders cannot be toggled for a completed vaccination.', 403);
  }

  const result = await pool.query<VaccinationRow>(
    `UPDATE vaccinations
     SET reminder_enabled = NOT reminder_enabled
     WHERE id = $1 AND mother_id = $2
     RETURNING ${COLUMNS}, ${VACCINE_NAME_EXPR}`,
    [vaccinationId, motherId]
  );
  return result.rows[0];
}

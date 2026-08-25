import { pool } from '../config/db';
import { AuthError } from './authService';

export interface ChildProfileRow {
  id: string;
  mother_id: string;
  name: string;
  gender: string | null;
  date_of_birth: string | null;
  birth_weight_kg: string | null;
  current_weight_kg: string | null;
  blood_group: string | null;
  birth_hospital_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * child_profiles.mother_id has a FK to mother_profiles(id), so an orphan
 * user (JWT role=mother but no mother_profiles row — see Part 1) can never
 * legitimately own a child row. This is the same 404 Parts 1/4/5 already use
 * for that state; a mother with a real profile and zero children is normal,
 * valid state and gets 200 + an empty array, not an error.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

export async function getMyChildren(motherId: string): Promise<ChildProfileRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<ChildProfileRow>(
    `SELECT id, mother_id, name, gender, date_of_birth, birth_weight_kg, current_weight_kg,
            blood_group, birth_hospital_id, created_at, updated_at
     FROM child_profiles
     WHERE mother_id = $1
     ORDER BY created_at ASC`,
    [motherId]
  );
  return result.rows;
}

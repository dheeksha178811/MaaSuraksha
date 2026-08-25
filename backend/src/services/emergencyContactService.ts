import { pool } from '../config/db';
import { AuthError } from './authService';

export interface EmergencyContactInput {
  name: string;
  relation?: string | null;
  phone: string;
}

export interface EmergencyContactRow {
  id: string;
  name: string;
  relation: string | null;
  phone: string;
  is_primary: boolean;
  created_at: string;
}

const CONTACT_COLUMNS = 'id, name, relation, phone, is_primary, created_at';

/**
 * emergency_contacts.mother_id has a FK to mother_profiles(id), so an
 * orphan user (JWT role=mother but no mother_profiles row — see Part 1)
 * can never legitimately have a contact row. Every entry point below checks
 * this first and throws the same 404 Part 1/2 already use for that state,
 * rather than letting a bare FK violation surface on write.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

/**
 * Returns null when the mother's profile exists but no emergency contact has
 * been set yet — that is normal, valid state (e.g. right after registration),
 * not an error, so it is never a 404.
 */
export async function getPrimaryEmergencyContact(motherId: string): Promise<EmergencyContactRow | null> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<EmergencyContactRow>(
    `SELECT ${CONTACT_COLUMNS}
     FROM emergency_contacts
     WHERE mother_id = $1 AND is_primary = true
     ORDER BY created_at ASC
     LIMIT 1`,
    [motherId]
  );
  return result.rows[0] ?? null;
}

/**
 * Upsert of the mother's single primary contact (the only shape the
 * frontend's EditEmergencyContactModal edits). Wrapped in a transaction with
 * a row lock on the mother's own mother_profiles row so two concurrent saves
 * for the same mother can't both see "no existing contact" and each insert
 * a separate is_primary row — the schema has no unique constraint to fall
 * back on for an ON CONFLICT upsert, so the lock is what keeps this safe.
 */
export async function upsertPrimaryEmergencyContact(
  motherId: string,
  input: EmergencyContactInput
): Promise<EmergencyContactRow> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lock = await client.query('SELECT id FROM mother_profiles WHERE id = $1 FOR UPDATE', [motherId]);
    if (lock.rowCount === 0) {
      throw new AuthError('Profile not found for this account.', 404);
    }

    const updated = await client.query<EmergencyContactRow>(
      `UPDATE emergency_contacts
       SET name = $2, relation = $3, phone = $4
       WHERE mother_id = $1 AND is_primary = true
       RETURNING ${CONTACT_COLUMNS}`,
      [motherId, input.name, input.relation ?? null, input.phone]
    );

    let row = updated.rows[0];
    if (!row) {
      const inserted = await client.query<EmergencyContactRow>(
        `INSERT INTO emergency_contacts (mother_id, name, relation, phone, is_primary)
         VALUES ($1, $2, $3, $4, true)
         RETURNING ${CONTACT_COLUMNS}`,
        [motherId, input.name, input.relation ?? null, input.phone]
      );
      row = inserted.rows[0];
    }

    await client.query('COMMIT');
    return row;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

import { pool } from '../config/db';
import { AuthError } from './authService';

export interface NutritionReminderRow {
  id: string;
  mother_id: string;
  title: string | null;
  description: string | null;
  timing: string | null;
  enabled: boolean;
}

const COLUMNS = `id, mother_id, title, description, timing, enabled`;

/**
 * nutrition_reminders.mother_id has a FK to mother_profiles(id), so an
 * orphan user (JWT role=mother but no mother_profiles row — see Part 1) can
 * never legitimately own a reminder row. Same 404 convention used
 * throughout Phase 4/5.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

export async function listMyNutritionReminders(motherId: string): Promise<NutritionReminderRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<NutritionReminderRow>(
    `SELECT ${COLUMNS} FROM nutrition_reminders WHERE mother_id = $1 ORDER BY title ASC`,
    [motherId]
  );
  return result.rows;
}

/**
 * Flips enabled on one of the mother's own reminders. Ported directly from
 * ReminderRow.tsx's own `onToggle` handler (unconditional
 * `enabled: !enabled`, no status/category gate — unlike vaccinations,
 * ReminderRow never disables the button) — never a client-supplied value.
 */
export async function toggleMyNutritionReminder(motherId: string, reminderId: string): Promise<NutritionReminderRow> {
  const existing = await pool.query<NutritionReminderRow>(
    `SELECT ${COLUMNS} FROM nutrition_reminders WHERE id = $1 AND mother_id = $2`,
    [reminderId, motherId]
  );
  if (!existing.rows[0]) {
    throw new AuthError('Reminder not found for this account.', 404);
  }

  const result = await pool.query<NutritionReminderRow>(
    `UPDATE nutrition_reminders
     SET enabled = NOT enabled
     WHERE id = $1 AND mother_id = $2
     RETURNING ${COLUMNS}`,
    [reminderId, motherId]
  );
  return result.rows[0];
}

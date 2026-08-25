import { pool } from '../config/db';
import { AuthError } from './authService';

export interface MilestoneRow {
  id: string;
  mother_id: string;
  child_id: string | null;
  recipient_type: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  target_age_range: string | null;
  status: string | null;
  achieved_date: string | null;
  notes: string | null;
  created_at: string;
}

const COLUMNS = `id, mother_id, child_id, recipient_type, category, title, description,
  target_age_range, status, achieved_date, notes, created_at`;

/**
 * milestones.mother_id has a FK to mother_profiles(id), so an orphan user
 * (JWT role=mother but no mother_profiles row — see Part 1) can never
 * legitimately own a milestone row. Same 404 convention used throughout
 * Phase 4/5.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

export async function listMyMilestones(motherId: string): Promise<MilestoneRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<MilestoneRow>(
    `SELECT ${COLUMNS}
     FROM milestones
     WHERE mother_id = $1
     ORDER BY created_at ASC`,
    [motherId]
  );
  return result.rows;
}

/**
 * Marks one of the mother's own milestones as achieved today. Ported
 * directly from MilestoneDetailsModal.tsx's own `canMarkAchieved` rule
 * (status !== 'achieved' && category !== 'MATERNAL_RECOVERY') rather than
 * invented — that modal's copy states MATERNAL_RECOVERY milestones are
 * "confirmed by your doctor... can't be marked complete from here", and a
 * milestone that's already achieved has no self-mark action in the UI at
 * all. achieved_date is always CURRENT_DATE, matching MOTHER_TODAY_ISO in
 * both frontend call sites — never accepted from the client.
 */
export async function markMyMilestoneAchieved(motherId: string, milestoneId: string): Promise<MilestoneRow> {
  const existing = await pool.query<MilestoneRow>(
    `SELECT ${COLUMNS} FROM milestones WHERE id = $1 AND mother_id = $2`,
    [milestoneId, motherId]
  );
  const milestone = existing.rows[0];
  if (!milestone) {
    throw new AuthError('Milestone not found for this account.', 404);
  }

  if (milestone.category === 'MATERNAL_RECOVERY') {
    throw new AuthError(
      'This milestone is confirmed by your doctor at your scheduled visit and cannot be marked achieved here.',
      403
    );
  }

  if (milestone.status === 'achieved') {
    throw new AuthError('This milestone has already been marked achieved.', 409);
  }

  const result = await pool.query<MilestoneRow>(
    `UPDATE milestones
     SET status = 'achieved', achieved_date = CURRENT_DATE
     WHERE id = $1 AND mother_id = $2
     RETURNING ${COLUMNS}`,
    [milestoneId, motherId]
  );
  return result.rows[0];
}

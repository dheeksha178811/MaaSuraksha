import { pool } from '../config/db';
import { AuthError } from './authService';

export interface DailyGoalRow {
  id: string;
  mother_id: string;
  category: string | null;
  title: string | null;
  target_label: string | null;
  target_count: number | null;
  completed_count: number;
  goal_date: string;
}

const COLUMNS = `id, mother_id, category, title, target_label, target_count, completed_count, goal_date`;

/**
 * daily_goals.mother_id has a FK to mother_profiles(id), so an orphan user
 * (JWT role=mother but no mother_profiles row — see Part 1) can never
 * legitimately own a goal row. Same 404 convention used throughout Phase 4/5.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

/**
 * Scoped to goal_date = CURRENT_DATE, matching the schema's own
 * UNIQUE(mother_id, category, goal_date) design and MyCarePage's use of
 * getDailyGoalsForMother as "today's snapshot" only — there's no evidenced
 * history-browsing feature to replicate.
 */
export async function listMyDailyGoals(motherId: string): Promise<DailyGoalRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<DailyGoalRow>(
    `SELECT ${COLUMNS}
     FROM daily_goals
     WHERE mother_id = $1 AND goal_date = CURRENT_DATE
     ORDER BY category ASC`,
    [motherId]
  );
  return result.rows;
}

/**
 * Ported directly from DailyGoalCard.tsx/MyCarePage.tsx's own clamping
 * logic (Math.min(target, completed+1) / Math.max(0, completed-1), and the
 * card's disabled-at-boundary buttons) rather than invented: the count is
 * clamped in SQL via LEAST/GREATEST, never rejected with an error — a
 * request that would exceed the bound is a no-op success, matching how the
 * frontend simply disables the button rather than surfacing an error state.
 */
async function adjustMyDailyGoal(motherId: string, goalId: string, direction: 1 | -1): Promise<DailyGoalRow> {
  const existing = await pool.query<DailyGoalRow>(
    `SELECT ${COLUMNS} FROM daily_goals WHERE id = $1 AND mother_id = $2`,
    [goalId, motherId]
  );
  if (!existing.rows[0]) {
    throw new AuthError('Daily goal not found for this account.', 404);
  }

  const updateSql =
    direction === 1
      ? `UPDATE daily_goals SET completed_count = LEAST(completed_count + 1, target_count) WHERE id = $1 AND mother_id = $2 RETURNING ${COLUMNS}`
      : `UPDATE daily_goals SET completed_count = GREATEST(completed_count - 1, 0) WHERE id = $1 AND mother_id = $2 RETURNING ${COLUMNS}`;

  const result = await pool.query<DailyGoalRow>(updateSql, [goalId, motherId]);
  return result.rows[0];
}

export const incrementMyDailyGoal = (motherId: string, goalId: string): Promise<DailyGoalRow> =>
  adjustMyDailyGoal(motherId, goalId, 1);

export const decrementMyDailyGoal = (motherId: string, goalId: string): Promise<DailyGoalRow> =>
  adjustMyDailyGoal(motherId, goalId, -1);

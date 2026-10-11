import { pool } from '../config/db';
import { AuthError } from './authService';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// In-app notifications (notifications table — migrations 003 + 010).
// Recipients are always derived server-side from the event's own database
// rows (never from a client-supplied id), reads and updates are always
// scoped to the authenticated user, and event notifications are idempotent
// via notifications.dedupe_key's partial UNIQUE index.
// ---------------------------------------------------------------------------

export type NotificationKind = 'consent' | 'referral';

export interface NewNotification {
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'normal' | 'urgent';
  // Internal in-app path only (e.g. '/hospital/referrals').
  actionUrl?: string;
  // Stable per event + recipient, e.g. 'referral:<id>:accepted'.
  dedupeKey: string;
  // Which notification preference governs this one.
  kind: NotificationKind;
}

/**
 * Whether the recipient's saved notification preferences allow this kind.
 * Only an explicit `false` suppresses (a missing settings row means defaults,
 * which are all on):
 *   mother   — notifications.app
 *   doctor   — notifications.inApp
 *   hospital — notifications.referralAlerts (referral events only)
 * Hospital consent notifications have no matching preference and are always sent.
 */
async function isAllowedByPreferences(recipientUserId: string, kind: NotificationKind): Promise<boolean> {
  const result = await pool.query<{ role: string; app: string | null; in_app: string | null; referral_alerts: string | null }>(
    `SELECT u.role,
            (SELECT notifications->>'app' FROM mother_settings WHERE mother_id = u.id) AS app,
            (SELECT notifications->>'inApp' FROM doctor_settings WHERE doctor_id = u.id) AS in_app,
            (SELECT notifications->>'referralAlerts' FROM hospital_settings WHERE hospital_id = u.id) AS referral_alerts
       FROM users u WHERE u.id = $1`,
    [recipientUserId]
  );
  const row = result.rows[0];
  if (!row) return false;
  if (row.role === 'mother') return row.app !== 'false';
  if (row.role === 'doctor') return row.in_app !== 'false';
  if (row.role === 'hospital' && kind === 'referral') return row.referral_alerts !== 'false';
  return true;
}

/**
 * Best-effort, idempotent notification for a real event. Never throws: a
 * notification problem must not fail the consent or referral action that
 * triggered it. Returns true only when a new row was created.
 */
export async function notify(n: NewNotification): Promise<boolean> {
  try {
    if (!(await isAllowedByPreferences(n.recipientUserId, n.kind))) return false;
    const result = await pool.query(
      `INSERT INTO notifications (recipient_user_id, type, title, message, priority, action_url, dedupe_key)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (recipient_user_id, dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING`,
      [n.recipientUserId, n.type, n.title, n.message, n.priority ?? 'normal', n.actionUrl ?? null, n.dedupeKey]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    logger.error('Create notification failed', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Reads / updates for the signed-in user
// ---------------------------------------------------------------------------

export interface NotificationView {
  id: string;
  type: string;
  title: string | null;
  message: string | null;
  priority: 'normal' | 'urgent';
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

const SELECT_COLUMNS = `id, type, title, message, priority, is_read AS "isRead", action_url AS "actionUrl", created_at AS "createdAt"`;
const LIST_LIMIT = 50;

export async function listNotifications(userId: string): Promise<{ notifications: NotificationView[]; unreadCount: number }> {
  const [rows, count] = await Promise.all([
    pool.query<NotificationView>(
      `SELECT ${SELECT_COLUMNS} FROM notifications WHERE recipient_user_id = $1 ORDER BY created_at DESC LIMIT ${LIST_LIMIT}`,
      [userId]
    ),
    pool.query<{ unread: number }>(
      'SELECT count(*)::int AS unread FROM notifications WHERE recipient_user_id = $1 AND is_read = false',
      [userId]
    ),
  ]);
  return { notifications: rows.rows, unreadCount: count.rows[0].unread };
}

/** Ownership is part of the WHERE clause: another user's id is simply "not found". */
export async function markNotificationRead(userId: string, notificationId: string): Promise<NotificationView> {
  const result = await pool.query<NotificationView>(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_user_id = $2 RETURNING ${SELECT_COLUMNS}`,
    [notificationId, userId]
  );
  if (!result.rows[0]) throw new AuthError('Notification not found.', 404);
  return result.rows[0];
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await pool.query('UPDATE notifications SET is_read = true WHERE recipient_user_id = $1 AND is_read = false', [userId]);
  return result.rowCount ?? 0;
}

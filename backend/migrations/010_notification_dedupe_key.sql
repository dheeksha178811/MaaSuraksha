-- MaaSuraksha — Migration 010: Notification de-duplication key
-- Scope: adds notifications.dedupe_key so event-driven notifications are
-- idempotent at the database level. Each event builds a stable key (for
-- example 'referral:<id>:accepted'); the partial UNIQUE index then makes a
-- repeated insert for the same recipient and event a no-op
-- (INSERT ... ON CONFLICT DO NOTHING), even under concurrent requests.
-- The existing notifications table has no column that can identify the source
-- event, which is why this column is necessary. NULL keys (manually created
-- notifications) are not constrained.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_recipient_dedupe
  ON notifications(recipient_user_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

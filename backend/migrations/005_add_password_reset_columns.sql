-- MaaSuraksha — Migration 005: Password reset support on users
-- Scope: two nullable columns on the existing users table so a single-use,
-- expiring password-reset token can be stored securely (as a hash, never
-- the raw token). No new tables. Does not modify any prior migration.

ALTER TABLE users
  ADD COLUMN reset_token_hash        TEXT,
  ADD COLUMN reset_token_expires_at  TIMESTAMPTZ;

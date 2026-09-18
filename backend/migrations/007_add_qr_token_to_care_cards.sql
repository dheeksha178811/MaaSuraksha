-- MaaSuraksha — Migration 007: Add opaque QR token to care_cards
-- Scope: Extends care_cards (migration 002) with a cryptographically random,
-- 64-char hex token used as the QR code payload. The token carries NO PHI —
-- it is an opaque lookup key only. Resolving it to care data requires a
-- valid JWT + active patient_care_records relationship (doctor or hospital).
--
-- qr_token uses gen_random_bytes from pgcrypto (enabled in migration 001) so
-- the value is never predictable from the maa_suraksha_id or mother_id.
-- The UNIQUE index ensures a compromised token can be rotated (future work)
-- without losing the care_card row itself.
--
-- Existing rows (if any) get a token backfilled in the same statement so the
-- column can immediately carry NOT NULL without a separate data-fill pass.

ALTER TABLE care_cards
  ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE;

-- Backfill any existing rows that were inserted before this migration.
UPDATE care_cards
   SET qr_token = encode(gen_random_bytes(32), 'hex')
 WHERE qr_token IS NULL;

-- Now enforce NOT NULL going forward.
ALTER TABLE care_cards
  ALTER COLUMN qr_token SET NOT NULL;

-- Index to make token-based lookups (GET /api/qr/scan/:token) O(log n).
CREATE INDEX IF NOT EXISTS idx_care_cards_qr_token ON care_cards(qr_token);

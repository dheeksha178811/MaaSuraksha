-- MaaSuraksha — Migration 009: Referral workflow columns
-- Scope: extends hospital_referrals (migration 003) for the real referral API.
-- Existing columns, status values and constraints are untouched; this only adds
--   * clinical_summary  — the sender's written summary, shown to the receiver
--   * rejection_reason  — required by the API when a referral is rejected
--   * one timestamp per lifecycle step (accepted/rejected/in_transit/completed/cancelled)
--   * a CHECK that a referral cannot target the sender's own hospital
--
-- clinical_summary is NOT NULL. The table had no rows when this was written;
-- the backfill below keeps the migration safe to run if that ever changes.

ALTER TABLE hospital_referrals
  ADD COLUMN IF NOT EXISTS clinical_summary TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS accepted_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS in_transit_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at     TIMESTAMPTZ;

UPDATE hospital_referrals SET clinical_summary = COALESCE(reason, '') WHERE clinical_summary IS NULL;

ALTER TABLE hospital_referrals ALTER COLUMN clinical_summary SET NOT NULL;

ALTER TABLE hospital_referrals
  ADD CONSTRAINT chk_hospital_referrals_distinct_hospitals CHECK (from_hospital_id <> to_hospital_id);

-- MaaSuraksha — Migration 006: Persistent display name on users
-- Scope: one NOT NULL column so every role (mother/doctor/hospital/admin)
-- has a real, persisted display name instead of relying on frontend-only
-- mock data (see Phase 6 Part 1 investigation: users/mother_profiles/
-- doctor_profiles/admin_profiles had no name column at all). Schema only —
-- no seed/demo data here; existing rows are backfilled with a safe
-- email-derived placeholder so the NOT NULL constraint can be applied
-- immediately, and the seed script is responsible for correcting known
-- demo identities to their real names afterward.

ALTER TABLE users ADD COLUMN name TEXT;

UPDATE users SET name = split_part(email, '@', 1) WHERE name IS NULL;

ALTER TABLE users ALTER COLUMN name SET NOT NULL;

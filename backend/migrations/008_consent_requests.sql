-- MaaSuraksha — Migration 008: QR consent / temporary-access requests
-- Scope: one table, consent_requests. After a doctor/hospital scans a mother's
-- QR (basic identity only), they may ask for additional sections of her record.
-- The mother must explicitly approve; approval sets a server-side expiry and
-- every protected read re-checks it. No PHI is stored here — only which
-- sections were asked for and the decision/expiry.
--
-- status is stored as pending/approved/denied. 'expired' is allowed by the
-- CHECK but is normally *derived* at read time (approved AND
-- access_expires_at <= now()), so expiry never depends on a background job.
--
-- requester_id references users(id): both doctor and hospital accounts are
-- users rows (doctor_profiles.id / hospital_profiles.id are users.id), which
-- is also what patient_care_records.doctor_id / hospital_id hold.

CREATE TABLE consent_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id           UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  requester_type      TEXT NOT NULL CHECK (requester_type IN ('doctor', 'hospital')),
  requester_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_sections  TEXT[] NOT NULL CHECK (
                        cardinality(requested_sections) > 0
                        AND requested_sections <@ ARRAY['reports', 'appointments', 'medications', 'vaccinations', 'growth']::text[]
                      ),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  requested_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at        TIMESTAMPTZ,
  access_expires_at   TIMESTAMPTZ,
  CHECK (status <> 'approved' OR (responded_at IS NOT NULL AND access_expires_at IS NOT NULL))
);

CREATE INDEX idx_consent_requests_mother ON consent_requests(mother_id, requested_at DESC);
CREATE INDEX idx_consent_requests_requester ON consent_requests(requester_id, mother_id, requested_at DESC);

-- At most one open (pending) request per requester per mother.
CREATE UNIQUE INDEX idx_consent_requests_one_pending
  ON consent_requests(requester_id, mother_id) WHERE status = 'pending';

-- MaaSuraksha — Migration 011: Maternal Risk & Progress analytics inputs
-- Scope: the schema had no structured blood-pressure readings and no recorded
-- warning signs (BP only existed as free text in notes / high_risk_factors),
-- and nowhere to record a clinician's review of a rule-based flag. Additive
-- only: three new tables, nothing existing is altered.
--
--   maternal_vitals           doctor-recorded BP readings
--   maternal_warning_signs    doctor-recorded maternal warning signs
--   risk_flag_reviews         a doctor's review decision on a rule-based flag
--
-- Rows are always written by the assigned doctor (the API derives doctor_id
-- from the JWT and checks patient_care_records ownership). flag_key in
-- risk_flag_reviews is the deterministic key the rule engine gives each flag
-- (e.g. 'BP_SEVERE:<reading id>'), so a review sticks to the exact event it
-- reviewed and a new reading / sign / missed visit raises a fresh flag.

CREATE TABLE IF NOT EXISTS maternal_vitals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_care_record_id  UUID NOT NULL REFERENCES patient_care_records(id) ON DELETE CASCADE,
  mother_id               UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  recorded_by_doctor_id   UUID NOT NULL REFERENCES doctor_profiles(id),
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  systolic_mmhg           SMALLINT NOT NULL CHECK (systolic_mmhg BETWEEN 50 AND 300),
  diastolic_mmhg          SMALLINT NOT NULL CHECK (diastolic_mmhg BETWEEN 30 AND 200),
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_maternal_vitals_systolic_gt_diastolic CHECK (systolic_mmhg > diastolic_mmhg)
);

CREATE INDEX IF NOT EXISTS idx_maternal_vitals_pcr_time ON maternal_vitals(patient_care_record_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS maternal_warning_signs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_care_record_id  UUID NOT NULL REFERENCES patient_care_records(id) ON DELETE CASCADE,
  mother_id               UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  recorded_by_doctor_id   UUID NOT NULL REFERENCES doctor_profiles(id),
  sign_code               TEXT NOT NULL CHECK (sign_code IN (
                            'SEVERE_HEADACHE', 'VISION_CHANGES', 'SEVERE_SWELLING',
                            'VAGINAL_BLEEDING', 'REDUCED_FETAL_MOVEMENT', 'FEVER',
                            'CHEST_PAIN_OR_BREATHLESSNESS', 'SEVERE_ABDOMINAL_PAIN',
                            'SEIZURE_OR_FAINTING')),
  noted_on                DATE NOT NULL DEFAULT CURRENT_DATE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maternal_warning_signs_pcr_date ON maternal_warning_signs(patient_care_record_id, noted_on DESC);

CREATE TABLE IF NOT EXISTS risk_flag_reviews (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_care_record_id  UUID NOT NULL REFERENCES patient_care_records(id) ON DELETE CASCADE,
  reviewed_by_doctor_id   UUID NOT NULL REFERENCES doctor_profiles(id),
  flag_key                TEXT NOT NULL,
  decision                TEXT NOT NULL CHECK (decision IN ('CONFIRMED', 'DISMISSED')),
  note                    TEXT,
  reviewed_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_care_record_id, flag_key)
);

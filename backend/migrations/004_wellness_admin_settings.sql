-- MaaSuraksha — Migration 004: Nutrition/wellness, admin oversight, settings
-- Scope (Step 4D): nutrition_plans, food_guidance_items,
-- exercise_guidance_items, daily_goals, nutrition_reminders,
-- high_risk_cases, immunization_coverage_targets, mother_settings,
-- doctor_settings, hospital_settings, admin_settings.
-- Depends on Migrations 001 (users, mother_profiles, doctor_profiles,
-- hospital_profiles, admin_profiles) and 002 (vaccine_catalog). Does not
-- modify or recreate any table from those migrations, or from 003. No auth
-- logic. No mock data. This is the final batch of the approved Step 3 schema.

-- ---------------------------------------------------------------------------
-- nutrition_plans — one active plan per mother
-- ---------------------------------------------------------------------------
CREATE TABLE nutrition_plans (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id                 UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  doctor_id                 UUID REFERENCES doctor_profiles(id),
  hospital_id               UUID REFERENCES hospital_profiles(id),
  stage_label               TEXT,
  daily_calorie_target      TEXT,
  protein_target            TEXT,
  hydration_target_liters   NUMERIC(3,1),
  focus_summary             TEXT,
  notes                     TEXT,
  last_reviewed_date        DATE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mother_id)
);

-- ---------------------------------------------------------------------------
-- food_guidance_items
-- ---------------------------------------------------------------------------
CREATE TABLE food_guidance_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id    UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  type         TEXT CHECK (type IN ('RECOMMENDED', 'LIMIT')),
  category     TEXT CHECK (category IN ('PROTEIN', 'IRON_RICH', 'CALCIUM', 'FIBER', 'HYDRATING', 'GENERAL')),
  name         TEXT,
  description  TEXT,
  examples     TEXT[]
);

CREATE INDEX idx_food_guidance_items_mother_type ON food_guidance_items(mother_id, type);

-- ---------------------------------------------------------------------------
-- exercise_guidance_items
-- ---------------------------------------------------------------------------
CREATE TABLE exercise_guidance_items (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id                UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  doctor_id                UUID REFERENCES doctor_profiles(id),
  name                     TEXT,
  category                 TEXT CHECK (category IN ('WALKING', 'PELVIC_FLOOR', 'STRETCHING', 'STRENGTH', 'REST')),
  recommended_frequency    TEXT,
  recommended_duration     TEXT,
  clearance                TEXT CHECK (clearance IN ('CLEARED', 'PENDING_CLEARANCE')),
  description              TEXT,
  safety_note              TEXT
);

CREATE INDEX idx_exercise_guidance_items_mother_id ON exercise_guidance_items(mother_id);

-- ---------------------------------------------------------------------------
-- daily_goals — goal_date is a schema addition beyond the mock (which only
-- ever held today's snapshot) so progress can persist across days
-- ---------------------------------------------------------------------------
CREATE TABLE daily_goals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id         UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  category          TEXT CHECK (category IN ('HYDRATION', 'NUTRITION', 'ACTIVITY', 'REST')),
  title             TEXT,
  target_label      TEXT,
  target_count      INT,
  completed_count   INT NOT NULL DEFAULT 0,
  goal_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (mother_id, category, goal_date)
);

-- ---------------------------------------------------------------------------
-- nutrition_reminders
-- ---------------------------------------------------------------------------
CREATE TABLE nutrition_reminders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id    UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  title        TEXT,
  description  TEXT,
  timing       TEXT,
  enabled      BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_nutrition_reminders_mother_id ON nutrition_reminders(mother_id);

-- ---------------------------------------------------------------------------
-- high_risk_cases — admin-level escalation workflow, distinct from the
-- clinical risk_level already tracked on patient_care_records
-- ---------------------------------------------------------------------------
CREATE TABLE high_risk_cases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id      UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  hospital_id    UUID NOT NULL REFERENCES hospital_profiles(id),
  doctor_id      UUID NOT NULL REFERENCES doctor_profiles(id),
  risk_level     TEXT CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  risk_factors   TEXT[],
  status         TEXT CHECK (status IN ('FLAGGED', 'UNDER_REVIEW', 'MONITORING', 'RESOLVED')),
  flagged_at     DATE,
  updated_at     DATE,
  notes          TEXT
);

CREATE INDEX idx_high_risk_cases_status ON high_risk_cases(status);
CREATE INDEX idx_high_risk_cases_hospital_id ON high_risk_cases(hospital_id);

-- ---------------------------------------------------------------------------
-- immunization_coverage_targets — denominator for Admin immunization
-- analytics; hospital_id NULL means program/state-wide
-- ---------------------------------------------------------------------------
CREATE TABLE immunization_coverage_targets (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_code       TEXT REFERENCES vaccine_catalog(code),
  hospital_id        UUID REFERENCES hospital_profiles(id),
  period_label       TEXT,
  target_population  INT,
  UNIQUE (vaccine_code, hospital_id, period_label)
);

-- ---------------------------------------------------------------------------
-- mother_settings — preference blob, 1:1 with mother_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE mother_settings (
  mother_id      UUID PRIMARY KEY REFERENCES mother_profiles(id) ON DELETE CASCADE,
  language       TEXT CHECK (language IN ('en', 'hi', 'kn', 'ml')) DEFAULT 'en',
  notifications  JSONB,
  reminders      JSONB,
  privacy        JSONB
);

-- ---------------------------------------------------------------------------
-- doctor_settings — preference blob, 1:1 with doctor_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE doctor_settings (
  doctor_id      UUID PRIMARY KEY REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  notifications  JSONB,
  communication  JSONB,
  workspace      JSONB,
  availability   JSONB,
  privacy        JSONB
);

-- ---------------------------------------------------------------------------
-- hospital_settings — preference blob, 1:1 with hospital_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_settings (
  hospital_id    UUID PRIMARY KEY REFERENCES hospital_profiles(id) ON DELETE CASCADE,
  facility       JSONB,
  notifications  JSONB,
  operational    JSONB,
  privacy        JSONB
);

-- ---------------------------------------------------------------------------
-- admin_settings — preference blob, 1:1 with admin_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE admin_settings (
  admin_id       UUID PRIMARY KEY REFERENCES admin_profiles(id) ON DELETE CASCADE,
  notifications  JSONB,
  program        JSONB,
  privacy        JSONB
);

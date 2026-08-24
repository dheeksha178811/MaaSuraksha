-- MaaSuraksha — Migration 001: Core identity & care-assignment tables
-- Scope (Step 4A): users, mother_profiles, doctor_profiles, hospital_profiles,
-- admin_profiles, child_profiles, emergency_contacts, patient_care_records.
-- No other tables. No auth logic. No mock data migrated.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- users — auth root shared by all four roles (mother/doctor/hospital/admin)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  phone         TEXT,
  role          TEXT NOT NULL CHECK (role IN ('mother', 'doctor', 'hospital', 'admin')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------------
-- hospital_profiles — 1:1 with users; created before doctor_profiles /
-- child_profiles / patient_care_records, which reference it
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_profiles (
  id                       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  facility_name            TEXT NOT NULL,
  facility_type            TEXT CHECK (facility_type IN ('Government PHC', 'District Hospital', 'Private Maternity Center')),
  license_number           TEXT UNIQUE,
  address                  TEXT,
  city                     TEXT,
  state                    TEXT,
  postal_code              TEXT,
  contact_number           TEXT,
  total_beds               INT NOT NULL DEFAULT 0,
  neonatal_icu_available   BOOLEAN NOT NULL DEFAULT false,
  status                   TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE')),
  tagline                  TEXT,
  established_year         SMALLINT,
  accreditations           TEXT[],
  visiting_hours           TEXT,
  emergency_contact_number TEXT,
  ambulance_available      BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospital_profiles_city_state ON hospital_profiles(city, state);
CREATE INDEX idx_hospital_profiles_status ON hospital_profiles(status);

-- ---------------------------------------------------------------------------
-- doctor_profiles — 1:1 with users
-- ---------------------------------------------------------------------------
CREATE TABLE doctor_profiles (
  id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization      TEXT,
  qualification       TEXT,
  hospital_id         UUID REFERENCES hospital_profiles(id),
  experience_years    SMALLINT,
  available_days      TEXT[],
  location            TEXT,
  bio                 TEXT,
  languages_spoken    TEXT[],
  consultation_modes  TEXT[],
  clinic_timings      JSONB,
  achievements        TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctor_profiles_hospital_id ON doctor_profiles(hospital_id);

-- ---------------------------------------------------------------------------
-- mother_profiles — 1:1 with users
-- ---------------------------------------------------------------------------
CREATE TABLE mother_profiles (
  id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age             SMALLINT,
  stage           TEXT CHECK (stage IN ('pregnancy', 'postpartum', 'infant_care')),
  pregnancy_week  SMALLINT,
  delivery_date   DATE,
  blood_group     TEXT,
  location        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mother_profiles_stage ON mother_profiles(stage);

-- ---------------------------------------------------------------------------
-- admin_profiles — 1:1 with users, deliberately thin
-- ---------------------------------------------------------------------------
CREATE TABLE admin_profiles (
  id                  UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  title               TEXT,
  jurisdiction_level  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- child_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE child_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id          UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  gender             TEXT CHECK (gender IN ('boy', 'girl')),
  date_of_birth      DATE,
  birth_weight_kg    NUMERIC(4,2),
  current_weight_kg  NUMERIC(4,2),
  blood_group        TEXT,
  birth_hospital_id  UUID REFERENCES hospital_profiles(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_profiles_mother_id ON child_profiles(mother_id);

-- ---------------------------------------------------------------------------
-- emergency_contacts — single source of truth (mock had this shape twice)
-- ---------------------------------------------------------------------------
CREATE TABLE emergency_contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id   UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  relation    TEXT,
  phone       TEXT NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emergency_contacts_mother_id ON emergency_contacts(mother_id);

-- ---------------------------------------------------------------------------
-- patient_care_records — single source of truth for a mother's current
-- doctor/hospital/stage/risk assignment (see Step 3 decisions)
-- ---------------------------------------------------------------------------
CREATE TABLE patient_care_records (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_code            TEXT UNIQUE,
  mother_id               UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  doctor_id               UUID NOT NULL REFERENCES doctor_profiles(id),
  hospital_id             UUID NOT NULL REFERENCES hospital_profiles(id),
  child_id                UUID REFERENCES child_profiles(id),
  stage                   TEXT CHECK (stage IN ('ANTENATAL', 'POSTNATAL')),
  status                  TEXT CHECK (status IN ('STABLE', 'FOLLOW_UP_DUE', 'REPORT_PENDING', 'NEW')),
  risk_level              TEXT CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  -- antenatal-only fields, nullable
  pregnancy_week          SMALLINT,
  expected_delivery_date  DATE,
  gravida                 TEXT,
  anc_visits_completed    SMALLINT,
  anc_visits_planned      SMALLINT,
  high_risk_factors       TEXT[],
  -- postnatal-only fields, nullable
  delivery_date           DATE,
  delivery_type           TEXT,
  postpartum_weeks        SMALLINT,
  recovery_status         TEXT,
  breastfeeding_status    TEXT,
  last_visit_date         DATE,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  registered_on           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_patient_care_records_active_mother
  ON patient_care_records(mother_id) WHERE is_active;
CREATE INDEX idx_patient_care_records_doctor_status ON patient_care_records(doctor_id, status);
CREATE INDEX idx_patient_care_records_hospital_id ON patient_care_records(hospital_id);
CREATE INDEX idx_patient_care_records_risk_level ON patient_care_records(risk_level);

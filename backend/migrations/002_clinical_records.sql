-- MaaSuraksha — Migration 002: Clinical & care records
-- Scope (Step 4B): care_cards, appointments, medications, vaccine_catalog,
-- vaccinations, growth_measurements, milestones, consultation_notes,
-- care_recommendations, documents.
-- Depends on Migration 001 (users, mother_profiles, doctor_profiles,
-- hospital_profiles, child_profiles, patient_care_records). Does not modify
-- or recreate any table from that migration. No auth logic. No mock data.

-- ---------------------------------------------------------------------------
-- care_cards — issued MaaSuraksha QR / care-identity card
-- ---------------------------------------------------------------------------
CREATE TABLE care_cards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id        UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  maa_suraksha_id  TEXT NOT NULL UNIQUE,
  issued_date      DATE,
  valid_through    DATE,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_cards_mother_id ON care_cards(mother_id);

-- ---------------------------------------------------------------------------
-- appointments — replaces the mock's Appointment / MotherAppointment /
-- DoctorAppointment shapes (one entity, viewed from different screens)
-- ---------------------------------------------------------------------------
CREATE TABLE appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id    UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  child_id     UUID REFERENCES child_profiles(id),
  doctor_id    UUID NOT NULL REFERENCES doctor_profiles(id),
  hospital_id  UUID NOT NULL REFERENCES hospital_profiles(id),
  category     TEXT,
  title        TEXT,
  appt_date    DATE,
  appt_time    TIME,
  location     TEXT,
  reason       TEXT,
  status       TEXT CHECK (status IN ('upcoming', 'completed', 'cancelled', 'rescheduled', 'requested')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_mother_date ON appointments(mother_id, appt_date);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appt_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ---------------------------------------------------------------------------
-- medications — replaces PatientMedication + MotherMedication
-- ---------------------------------------------------------------------------
CREATE TABLE medications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id     UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  child_id      UUID REFERENCES child_profiles(id),
  doctor_id     UUID REFERENCES doctor_profiles(id),
  hospital_id   UUID REFERENCES hospital_profiles(id),
  name          TEXT NOT NULL,
  dosage        TEXT,
  frequency     TEXT,
  timing        TEXT,
  start_date    DATE,
  end_date      DATE,
  status        TEXT CHECK (status IN ('active', 'completed')),
  instructions  TEXT,
  caution       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medications_mother_status ON medications(mother_id, status);
CREATE INDEX idx_medications_doctor_id ON medications(doctor_id);

-- ---------------------------------------------------------------------------
-- vaccine_catalog — lookup shared by vaccinations + (later) vaccine_inventory
-- ---------------------------------------------------------------------------
CREATE TABLE vaccine_catalog (
  code                     TEXT PRIMARY KEY,
  name                     TEXT NOT NULL,
  target_age_description   TEXT
);

-- ---------------------------------------------------------------------------
-- vaccinations — replaces VaccinationRecord + MotherVaccinationRecord
-- ---------------------------------------------------------------------------
CREATE TABLE vaccinations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id          UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  child_id           UUID REFERENCES child_profiles(id),
  doctor_id          UUID REFERENCES doctor_profiles(id),
  hospital_id        UUID REFERENCES hospital_profiles(id),
  recipient_type     TEXT CHECK (recipient_type IN ('MOTHER', 'CHILD')),
  vaccine_code       TEXT REFERENCES vaccine_catalog(code),
  dose_label         TEXT,
  recommended_date   DATE,
  given_date         DATE,
  status             TEXT CHECK (status IN ('completed', 'due_soon', 'upcoming', 'overdue')),
  location           TEXT,
  administered_by    TEXT,
  notes              TEXT,
  reminder_enabled   BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vaccinations_child_status ON vaccinations(child_id, status);
CREATE INDEX idx_vaccinations_mother_status ON vaccinations(mother_id, status);
CREATE INDEX idx_vaccinations_vaccine_code ON vaccinations(vaccine_code);

-- ---------------------------------------------------------------------------
-- growth_measurements
-- ---------------------------------------------------------------------------
CREATE TABLE growth_measurements (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id                UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  child_id                 UUID REFERENCES child_profiles(id),
  doctor_id                UUID REFERENCES doctor_profiles(id),
  hospital_id              UUID REFERENCES hospital_profiles(id),
  recipient_type           TEXT CHECK (recipient_type IN ('MOTHER', 'CHILD')),
  measured_on              DATE,
  weight_kg                NUMERIC(5,2),
  height_cm                NUMERIC(5,2),
  head_circumference_cm    NUMERIC(5,2),
  context                  TEXT,
  notes                    TEXT,
  logged_by_mother         BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_growth_measurements_child_date ON growth_measurements(child_id, measured_on);
CREATE INDEX idx_growth_measurements_mother_date ON growth_measurements(mother_id, measured_on);

-- ---------------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------------
CREATE TABLE milestones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id          UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  child_id           UUID REFERENCES child_profiles(id),
  recipient_type     TEXT CHECK (recipient_type IN ('MOTHER', 'CHILD')),
  category           TEXT CHECK (category IN ('MOTOR', 'COGNITIVE', 'SOCIAL', 'LANGUAGE', 'MATERNAL_RECOVERY')),
  title              TEXT,
  description        TEXT,
  target_age_range   TEXT,
  status             TEXT CHECK (status IN ('achieved', 'due_soon', 'upcoming')),
  achieved_date      DATE,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_child_status ON milestones(child_id, status);
CREATE INDEX idx_milestones_mother_status ON milestones(mother_id, status);

-- ---------------------------------------------------------------------------
-- consultation_notes — replaces ConsultationNote + ConsultationLogEntry
-- ---------------------------------------------------------------------------
CREATE TABLE consultation_notes (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_care_record_id   UUID NOT NULL REFERENCES patient_care_records(id) ON DELETE CASCADE,
  doctor_id                UUID NOT NULL REFERENCES doctor_profiles(id),
  appointment_id           UUID REFERENCES appointments(id),
  note_date                DATE,
  title                    TEXT,
  note                     TEXT,
  visible_to_patient       BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consultation_notes_pcr_date ON consultation_notes(patient_care_record_id, note_date);
CREATE INDEX idx_consultation_notes_doctor_id ON consultation_notes(doctor_id);

-- ---------------------------------------------------------------------------
-- care_recommendations
-- ---------------------------------------------------------------------------
CREATE TABLE care_recommendations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_care_record_id   UUID NOT NULL REFERENCES patient_care_records(id) ON DELETE CASCADE,
  doctor_id                UUID NOT NULL REFERENCES doctor_profiles(id),
  type                     TEXT CHECK (type IN ('NUTRITION', 'MEDICATION', 'LIFESTYLE', 'FOLLOW_UP', 'GENERAL')),
  title                    TEXT,
  description              TEXT,
  rec_date                 DATE,
  active                   BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_recommendations_pcr_active ON care_recommendations(patient_care_record_id, active);

-- ---------------------------------------------------------------------------
-- documents — mock's "Report" type, renamed to avoid clashing with the
-- generated HospitalReport/AdminReport concept from Step 3
-- ---------------------------------------------------------------------------
CREATE TABLE documents (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id                UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  child_id                 UUID REFERENCES child_profiles(id),
  patient_care_record_id   UUID REFERENCES patient_care_records(id),
  uploaded_by_user_id      UUID REFERENCES users(id),
  hospital_id              UUID REFERENCES hospital_profiles(id),
  name                     TEXT NOT NULL,
  category                 TEXT CHECK (category IN ('ULTRASOUND', 'BLOOD_TEST', 'PRESCRIPTION', 'OTHER')),
  doc_date                 DATE,
  status                   TEXT CHECK (status IN ('COMPLETED', 'PENDING', 'UPCOMING')),
  description              TEXT,
  file_size                TEXT,
  file_type                TEXT,
  file_url                 TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_mother_date ON documents(mother_id, doc_date);
CREATE INDEX idx_documents_pcr_id ON documents(patient_care_record_id);
CREATE INDEX idx_documents_category ON documents(category);

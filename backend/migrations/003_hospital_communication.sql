-- MaaSuraksha — Migration 003: Hospital operations & communication
-- Scope (Step 4C): conversations, messages, doctor_contact_options,
-- notifications, alerts, hospital_activity_log, hospital_beds,
-- hospital_admissions, delivery_records, neonatal_records,
-- vaccine_inventory, hospital_referrals, hospital_services,
-- care_team_members.
-- Depends on Migrations 001 (users, mother_profiles, doctor_profiles,
-- hospital_profiles, child_profiles, patient_care_records) and 002
-- (vaccine_catalog). Does not modify or recreate any table from those
-- migrations. No auth logic. No mock data.

-- ---------------------------------------------------------------------------
-- doctor_contact_options
-- ---------------------------------------------------------------------------
CREATE TABLE doctor_contact_options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id    UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  type         TEXT CHECK (type IN ('CALL', 'MESSAGE', 'VIDEO_CONSULT', 'EMERGENCY')),
  label        TEXT,
  value        TEXT,
  description  TEXT,
  available    BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_doctor_contact_options_doctor_id ON doctor_contact_options(doctor_id);

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------
CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id   UUID NOT NULL REFERENCES doctor_profiles(id),
  mother_id   UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  status      TEXT CHECK (status IN ('active', 'resolved')),
  priority    TEXT CHECK (priority IN ('normal', 'urgent')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, mother_id)
);

CREATE INDEX idx_conversations_status ON conversations(status);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id   UUID NOT NULL REFERENCES users(id),
  sender_role      TEXT CHECK (sender_role IN ('doctor', 'patient')),
  body             TEXT NOT NULL,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at          TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation_sent ON messages(conversation_id, sent_at);

-- ---------------------------------------------------------------------------
-- notifications — replaces NotificationItem + DoctorNotification; keyed on
-- recipient_user_id so it extends to hospital/admin recipients for free
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id                               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  related_patient_care_record_id   UUID REFERENCES patient_care_records(id),
  type                             TEXT NOT NULL,
  title                            TEXT,
  message                          TEXT,
  priority                         TEXT CHECK (priority IN ('normal', 'urgent')) DEFAULT 'normal',
  is_read                          BOOLEAN NOT NULL DEFAULT false,
  action_url                       TEXT,
  created_at                       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ---------------------------------------------------------------------------
-- alerts — replaces HospitalAlert + AdminAlert
-- ---------------------------------------------------------------------------
CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope        TEXT NOT NULL CHECK (scope IN ('HOSPITAL', 'PROGRAM')),
  hospital_id  UUID REFERENCES hospital_profiles(id),
  type         TEXT NOT NULL,
  severity     TEXT CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  title        TEXT,
  description  TEXT,
  status       TEXT CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_scope_status ON alerts(scope, status);
CREATE INDEX idx_alerts_hospital_id ON alerts(hospital_id);

-- ---------------------------------------------------------------------------
-- hospital_activity_log
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  UUID NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  description  TEXT,
  related_id   UUID,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospital_activity_log_hospital_time ON hospital_activity_log(hospital_id, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- hospital_beds
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_beds (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      UUID NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
  ward             TEXT,
  bed_number       TEXT,
  bed_type         TEXT CHECK (bed_type IN ('GENERAL', 'MATERNITY', 'POSTNATAL', 'NICU', 'EMERGENCY')),
  status           TEXT CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
  last_updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hospital_id, ward, bed_number)
);

CREATE INDEX idx_hospital_beds_hospital_status ON hospital_beds(hospital_id, status);

-- ---------------------------------------------------------------------------
-- hospital_admissions — mock's "HospitalPatient", renamed to avoid clashing
-- with patient_care_records. bed_id here is the single source of truth for
-- bed<->patient assignment (hospital_beds has no patient_id column).
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_admissions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id              UUID NOT NULL REFERENCES hospital_profiles(id),
  mother_id                UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  doctor_id                UUID NOT NULL REFERENCES doctor_profiles(id),
  patient_care_record_id   UUID REFERENCES patient_care_records(id),
  status                   TEXT CHECK (status IN ('ADMITTED', 'OUTPATIENT', 'DISCHARGED', 'TRANSFERRED', 'POSTPARTUM')),
  risk_level               TEXT CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH')),
  admission_date           DATE,
  discharge_date           DATE,
  care_type                TEXT CHECK (care_type IN ('ANTENATAL', 'DELIVERY', 'POSTNATAL', 'NEONATAL', 'GENERAL')),
  ward                     TEXT,
  bed_id                   UUID REFERENCES hospital_beds(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospital_admissions_hospital_status ON hospital_admissions(hospital_id, status);
CREATE INDEX idx_hospital_admissions_mother_id ON hospital_admissions(mother_id);

-- ---------------------------------------------------------------------------
-- delivery_records
-- ---------------------------------------------------------------------------
CREATE TABLE delivery_records (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id              UUID NOT NULL REFERENCES hospital_profiles(id),
  mother_id                UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  doctor_id                UUID NOT NULL REFERENCES doctor_profiles(id),
  admission_id             UUID REFERENCES hospital_admissions(id),
  delivery_date            DATE,
  delivery_time            TIME,
  delivery_type            TEXT CHECK (delivery_type IN ('VAGINAL', 'C_SECTION', 'ASSISTED')),
  status                   TEXT CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  gestational_age_weeks    SMALLINT,
  baby_count               SMALLINT NOT NULL DEFAULT 1,
  maternal_outcome         TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_records_hospital_date ON delivery_records(hospital_id, delivery_date);
CREATE INDEX idx_delivery_records_mother_id ON delivery_records(mother_id);

-- ---------------------------------------------------------------------------
-- neonatal_records
-- ---------------------------------------------------------------------------
CREATE TABLE neonatal_records (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id              UUID NOT NULL REFERENCES hospital_profiles(id),
  mother_id                UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  doctor_id                UUID NOT NULL REFERENCES doctor_profiles(id),
  delivery_id              UUID NOT NULL REFERENCES delivery_records(id),
  child_id                 UUID REFERENCES child_profiles(id),
  bed_id                   UUID REFERENCES hospital_beds(id),
  date_of_birth            DATE,
  gender                   TEXT CHECK (gender IN ('boy', 'girl')),
  birth_weight_kg          NUMERIC(4,2),
  gestational_age_weeks    SMALLINT,
  care_level               TEXT CHECK (care_level IN ('ROUTINE', 'OBSERVATION', 'NICU', 'SPECIAL_CARE')),
  status                   TEXT CHECK (status IN ('STABLE', 'OBSERVATION', 'CRITICAL', 'DISCHARGED', 'TRANSFERRED')),
  admission_date           DATE,
  discharge_date           DATE,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neonatal_records_hospital_status ON neonatal_records(hospital_id, status);
CREATE INDEX idx_neonatal_records_delivery_id ON neonatal_records(delivery_id);

-- ---------------------------------------------------------------------------
-- vaccine_inventory — cold-chain stock per hospital; vaccine_code references
-- the vaccine_catalog lookup created in Migration 002
-- ---------------------------------------------------------------------------
CREATE TABLE vaccine_inventory (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id           UUID NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
  vaccine_code          TEXT REFERENCES vaccine_catalog(code),
  batch_number          TEXT,
  manufacturer          TEXT,
  quantity_received     INT,
  quantity_available    INT,
  expiry_date           DATE,
  received_date         DATE,
  storage_location      TEXT,
  min_temperature       NUMERIC(4,1),
  max_temperature       NUMERIC(4,1),
  current_temperature   NUMERIC(4,1),
  temperature_status    TEXT CHECK (temperature_status IN ('NORMAL', 'WARNING', 'CRITICAL')),
  status                TEXT CHECK (status IN ('AVAILABLE', 'LOW_STOCK', 'EXPIRED', 'QUARANTINED')),
  UNIQUE (hospital_id, batch_number)
);

CREATE INDEX idx_vaccine_inventory_hospital_status ON vaccine_inventory(hospital_id, status);
CREATE INDEX idx_vaccine_inventory_expiry ON vaccine_inventory(expiry_date);

-- ---------------------------------------------------------------------------
-- hospital_referrals — the mock's own "hospitalId" (viewing console) is
-- dropped; it always equals from_hospital_id
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_referrals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id             UUID NOT NULL REFERENCES mother_profiles(id) ON DELETE CASCADE,
  from_hospital_id      UUID NOT NULL REFERENCES hospital_profiles(id),
  to_hospital_id        UUID NOT NULL REFERENCES hospital_profiles(id),
  referring_doctor_id   UUID NOT NULL REFERENCES doctor_profiles(id),
  reason                TEXT,
  priority              TEXT CHECK (priority IN ('ROUTINE', 'URGENT', 'EMERGENCY')),
  status                TEXT CHECK (status IN ('PENDING', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED', 'CANCELLED')),
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospital_referrals_from_status ON hospital_referrals(from_hospital_id, status);
CREATE INDEX idx_hospital_referrals_to_status ON hospital_referrals(to_hospital_id, status);
CREATE INDEX idx_hospital_referrals_mother_id ON hospital_referrals(mother_id);

-- ---------------------------------------------------------------------------
-- hospital_services
-- ---------------------------------------------------------------------------
CREATE TABLE hospital_services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
  name          TEXT,
  category      TEXT CHECK (category IN ('ANTENATAL', 'DELIVERY', 'POSTNATAL', 'PEDIATRIC', 'DIAGNOSTIC', 'EMERGENCY')),
  description   TEXT,
  availability  TEXT
);

CREATE INDEX idx_hospital_services_hospital_category ON hospital_services(hospital_id, category);

-- ---------------------------------------------------------------------------
-- care_team_members
-- ---------------------------------------------------------------------------
CREATE TABLE care_team_members (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id          UUID NOT NULL REFERENCES hospital_profiles(id) ON DELETE CASCADE,
  doctor_id            UUID REFERENCES doctor_profiles(id),
  name                 TEXT,
  role_title           TEXT,
  department           TEXT,
  is_primary_doctor    BOOLEAN NOT NULL DEFAULT false,
  contact_note         TEXT
);

CREATE INDEX idx_care_team_members_hospital_id ON care_team_members(hospital_id);

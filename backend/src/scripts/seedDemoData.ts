/**
 * Idempotent demo-data seed for the MaaSuraksha core identity/relationship
 * tables (migration 001). Reuses the exact demo identities already
 * established in the frontend mocks — Ananya Kapoor / Vihaan Kapoor /
 * Dr. Priya Menon / Sunrise Women & Children Hospital (frontend/src/data/
 * mockData.ts) and the admin identity from frontend/src/hooks/useMockAuth.ts
 * — rather than inventing a new dataset. Only fields with an evidenced value
 * in those mocks are populated; everything else is left NULL rather than
 * fabricated (e.g. patient_care_records.status/risk_level, which no mock
 * assigns to Ananya specifically).
 *
 * Safe to run repeatedly: every insert is preceded by an existence check
 * (or reuses an already-idempotent service function), so re-running never
 * creates duplicates.
 *
 * Usage: npm run seed:demo
 */
import { pool } from '../config/db';
import { registerUser } from '../services/authService';
import { upsertPrimaryEmergencyContact } from '../services/emergencyContactService';

const DEMO_PASSWORD = 'Demo@12345';

async function findUserIdByEmail(email: string): Promise<string | null> {
  const result = await pool.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
  return result.rows[0]?.id ?? null;
}

async function ensureUser(
  email: string,
  name: string,
  role: string,
  phone: string | undefined,
  profile: Record<string, unknown>
): Promise<string> {
  const existingId = await findUserIdByEmail(email);
  if (existingId) {
    // Self-heals rows created before migration 006 added users.name (they
    // were backfilled with an email-derived placeholder) — brings them in
    // line with the real demo identity without touching anything else.
    await pool.query('UPDATE users SET name = $2 WHERE id = $1 AND name IS DISTINCT FROM $2', [existingId, name]);
    console.log(`  already exists: ${email}`);
    return existingId;
  }
  const { user } = await registerUser(email, DEMO_PASSWORD, name, role, phone, profile);
  console.log(`  created: ${email}`);
  return user.id;
}

async function ensureChild(motherId: string, birthHospitalId: string): Promise<string> {
  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM child_profiles WHERE mother_id = $1 AND name = $2',
    [motherId, 'Vihaan Kapoor']
  );
  if (existing.rows[0]) {
    console.log('  already exists: Vihaan Kapoor');
    return existing.rows[0].id;
  }
  const result = await pool.query<{ id: string }>(
    `INSERT INTO child_profiles (mother_id, name, gender, date_of_birth, birth_weight_kg, current_weight_kg, blood_group, birth_hospital_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [motherId, 'Vihaan Kapoor', 'boy', '2026-07-18', 3.2, 4.1, 'O+', birthHospitalId]
  );
  console.log('  created: Vihaan Kapoor');
  return result.rows[0].id;
}

async function ensureCareAssignment(motherId: string, doctorId: string, hospitalId: string, childId: string): Promise<void> {
  const existing = await pool.query(
    'SELECT id FROM patient_care_records WHERE mother_id = $1 AND is_active = true',
    [motherId]
  );
  if (existing.rows[0]) {
    console.log('  already exists: active care assignment');
    return;
  }
  // stage/delivery_date mirror mother_profiles' own evidenced values; status
  // and risk_level are left NULL — no mock assigns Ananya a specific care
  // status or risk level, and that would be clinical judgment, not seed data.
  await pool.query(
    `INSERT INTO patient_care_records (mother_id, doctor_id, hospital_id, child_id, stage, delivery_date, is_active)
     VALUES ($1, $2, $3, $4, 'POSTNATAL', $5, true)`,
    [motherId, doctorId, hospitalId, childId, '2026-07-18']
  );
  console.log('  created: active care assignment (Ananya Kapoor <-> Dr. Priya Menon @ Sunrise)');
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error(
      'Refusing to seed demo data (with a well-known demo password) into a production environment.\n' +
        'Set ALLOW_PROD_SEED=true to override.'
    );
    process.exitCode = 1;
    return;
  }

  try {
    console.log('Seeding hospital: Sunrise Women & Children Hospital');
    // users.name mirrors facility_name for an institutional identity —
    // same real value in both places, not a duplicated invented one.
    const hospitalId = await ensureUser('care@sunrisewch.org', 'Sunrise Women & Children Hospital', 'hospital', undefined, {
      facilityName: 'Sunrise Women & Children Hospital',
      facilityType: 'Private Maternity Center',
      licenseNumber: 'KA-MED-2024-8842',
      address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      contactNumber: '+91 80 2525 9000',
      totalBeds: 120,
      neonatalIcuAvailable: true,
      status: 'ACTIVE',
    });

    console.log('Seeding doctor: Dr. Priya Menon');
    const doctorId = await ensureUser('priya.menon@sunrisewch.org', 'Dr. Priya Menon', 'doctor', undefined, {
      specialization: 'Consultant Gynecologist & Obstetrician',
      qualification: 'MBBS, MS (OBG), DNB',
      hospitalId,
      experienceYears: 14,
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      location: 'Indiranagar, Bengaluru',
    });

    console.log('Seeding mother: Ananya Kapoor');
    const motherId = await ensureUser('ananya.kapoor@example.com', 'Ananya Kapoor', 'mother', '+91 98765 43210', {
      age: 32,
      stage: 'postpartum',
      deliveryDate: '2026-07-18',
      bloodGroup: 'O+',
      location: 'Indiranagar, Bengaluru',
    });

    console.log('Seeding admin: Dr. Suniti Sharma (Director)');
    await ensureUser('admin.director@health.gov.in', 'Dr. Suniti Sharma (Director)', 'admin', undefined, {
      title: 'Director',
    });

    console.log('Seeding child: Vihaan Kapoor');
    const childId = await ensureChild(motherId, hospitalId);

    console.log('Seeding emergency contact: Rohit Kapoor');
    await upsertPrimaryEmergencyContact(motherId, {
      name: 'Rohit Kapoor',
      relation: 'Spouse',
      phone: '+91 98765 43211',
    });

    console.log('Seeding care assignment: Ananya Kapoor <-> Dr. Priya Menon @ Sunrise');
    await ensureCareAssignment(motherId, doctorId, hospitalId, childId);

    console.log('\nDemo seed complete.');
    console.log(`Demo login password for all seeded accounts: ${DEMO_PASSWORD}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

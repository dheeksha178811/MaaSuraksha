/**
 * Idempotent demo-data seed for the MaaSuraksha core identity/relationship
 * tables (migration 001) and the clinical tables (migration 002) the real
 * mother/doctor pages and APIs read from — appointments, medications,
 * vaccinations (+ vaccine_catalog), growth_measurements, milestones,
 * care_recommendations, consultation_notes, documents. Reuses the exact demo
 * identities and clinical history already established in the frontend mocks
 * — Ananya Kapoor / Vihaan Kapoor / Dr. Priya Menon / Sunrise Women &
 * Children Hospital (frontend/src/data/mockData.ts,
 * motherAppointmentsMockData.ts, motherVaccinationsMockData.ts,
 * motherGrowthMockData.ts, doctorPatientsMockData.ts, reportsMockData.ts)
 * and the admin identity from frontend/src/hooks/useMockAuth.ts — rather
 * than inventing a new dataset. Only fields with an evidenced value in those
 * mocks are populated; everything else is left NULL rather than fabricated.
 *
 * The rest of Dr. Priya Menon's roster (Meera Iyer, Fatima Sheikh, Kavya
 * Reddy, Sneha Joshi, Ritika Verma) and the second doctor's roster (Dr.
 * Arjun Nair @ Andheri Care Women & Children Hospital: Ishita Rao, Priyanka
 * Shah, Neha Deshmukh, Sana Khan) are ported the same way from
 * doctorPatientsMockData.ts's doctorPatients/doctorAppointments/
 * doctorReports/doctorMedications/doctorRecommendations/
 * doctorConsultationNotes (pat_02..pat_09) — the mock's own comment on pat_09
 * already documents it as "assigned to a DIFFERENT doctor... must never
 * surface in Dr. Priya Menon's views", which is exactly the second-doctor
 * isolation this seed now models for real. Antenatal patients are seeded
 * with no child_profiles row at all (delivery hasn't happened), so
 * GET /auth/me/children genuinely returns [] for them.
 *
 * Safe to run repeatedly: every insert is preceded by an existence check
 * (or reuses an already-idempotent service function), so re-running never
 * creates duplicates and never touches a real row a user created by hand
 * through the app (e.g. a report actually uploaded via the doctor UI).
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

interface ChildSeed {
  name: string;
  gender: 'boy' | 'girl';
  dateOfBirth: string;
  birthWeightKg: number;
  currentWeightKg: number;
  bloodGroup: string;
}

// Generic version of ensureChild for the additional postnatal mothers below —
// same shape/idempotency key (mother_id + name), just data-driven instead of
// hardcoded to Vihaan Kapoor.
async function ensureNamedChild(motherId: string, birthHospitalId: string, child: ChildSeed): Promise<string> {
  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM child_profiles WHERE mother_id = $1 AND name = $2',
    [motherId, child.name]
  );
  if (existing.rows[0]) {
    console.log(`  already exists: ${child.name}`);
    return existing.rows[0].id;
  }
  const result = await pool.query<{ id: string }>(
    `INSERT INTO child_profiles (mother_id, name, gender, date_of_birth, birth_weight_kg, current_weight_kg, blood_group, birth_hospital_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [motherId, child.name, child.gender, child.dateOfBirth, child.birthWeightKg, child.currentWeightKg, child.bloodGroup, birthHospitalId]
  );
  console.log(`  created: ${child.name}`);
  return result.rows[0].id;
}

async function ensureCareAssignment(motherId: string, doctorId: string, hospitalId: string, childId: string): Promise<string> {
  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM patient_care_records WHERE mother_id = $1 AND is_active = true',
    [motherId]
  );
  if (existing.rows[0]) {
    console.log('  already exists: active care assignment');
    return existing.rows[0].id;
  }
  // stage/delivery_date mirror mother_profiles' own evidenced values; status
  // and risk_level are left NULL — no mock assigns Ananya a specific care
  // status or risk level, and that would be clinical judgment, not seed data.
  const result = await pool.query<{ id: string }>(
    `INSERT INTO patient_care_records (mother_id, doctor_id, hospital_id, child_id, stage, delivery_date, is_active)
     VALUES ($1, $2, $3, $4, 'POSTNATAL', $5, true)
     RETURNING id`,
    [motherId, doctorId, hospitalId, childId, '2026-07-18']
  );
  console.log('  created: active care assignment (Ananya Kapoor <-> Dr. Priya Menon @ Sunrise)');
  return result.rows[0].id;
}

interface CareAssignmentSeed {
  stage: 'ANTENATAL' | 'POSTNATAL';
  status: string;
  riskLevel: string;
  pregnancyWeek?: number;
  expectedDeliveryDate?: string;
  gravida?: string;
  ancVisitsCompleted?: number;
  ancVisitsPlanned?: number;
  highRiskFactors?: string[];
  deliveryDate?: string;
  deliveryType?: string;
  postpartumWeeks?: number;
  recoveryStatus?: string;
  breastfeedingStatus?: string;
  lastVisitDate?: string;
  registeredOn?: string;
}

// Generic version of ensureCareAssignment carrying the full antenatal/postnatal
// column set (migration 001's patient_care_records), for the additional
// mothers below — ported from doctorPatientsMockData.ts's AssignedPatient
// entries (pat_02..pat_09), not invented. Same idempotency key (one active
// row per mother_id, enforced by the table's own partial unique index).
async function ensureCareAssignmentFull(
  motherId: string,
  doctorId: string,
  hospitalId: string,
  childId: string | null,
  seed: CareAssignmentSeed
): Promise<string> {
  const existing = await pool.query<{ id: string }>(
    'SELECT id FROM patient_care_records WHERE mother_id = $1 AND is_active = true',
    [motherId]
  );
  if (existing.rows[0]) {
    console.log('  already exists: active care assignment');
    return existing.rows[0].id;
  }
  const result = await pool.query<{ id: string }>(
    `INSERT INTO patient_care_records (
       mother_id, doctor_id, hospital_id, child_id, stage, status, risk_level,
       pregnancy_week, expected_delivery_date, gravida, anc_visits_completed, anc_visits_planned, high_risk_factors,
       delivery_date, delivery_type, postpartum_weeks, recovery_status, breastfeeding_status,
       last_visit_date, registered_on, is_active
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,true)
     RETURNING id`,
    [
      motherId,
      doctorId,
      hospitalId,
      childId,
      seed.stage,
      seed.status,
      seed.riskLevel,
      seed.pregnancyWeek ?? null,
      seed.expectedDeliveryDate ?? null,
      seed.gravida ?? null,
      seed.ancVisitsCompleted ?? null,
      seed.ancVisitsPlanned ?? null,
      seed.highRiskFactors ?? null,
      seed.deliveryDate ?? null,
      seed.deliveryType ?? null,
      seed.postpartumWeeks ?? null,
      seed.recoveryStatus ?? null,
      seed.breastfeedingStatus ?? null,
      seed.lastVisitDate ?? null,
      seed.registeredOn ?? null,
    ]
  );
  console.log('  created: active care assignment');
  return result.rows[0].id;
}

// ---------------------------------------------------------------------------
// Clinical data — mapped 1:1 from the frontend mock datasets these real
// pages/APIs replaced (motherAppointmentsMockData.ts, motherVaccinationsMockData.ts,
// motherGrowthMockData.ts, doctorPatientsMockData.ts, and reportsMockData.ts),
// not invented. Every insert is guarded by a per-row existence check on a
// natural key from that row (mother/date/title-ish), so re-running the seed
// never duplicates rows, and it never touches unrelated rows a real user
// created through the app (e.g. a real report someone uploaded by hand).
// ---------------------------------------------------------------------------

// "10:30 AM" (mock's display format) -> "10:30" (what a TIME column accepts).
function to24Hour(time12h: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time12h.trim());
  if (!match) throw new Error(`Unrecognized time format: ${time12h}`);
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'AM' && hour === 12) hour = 0;
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}

interface AppointmentSeed {
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  reason?: string;
  status: string;
  notes?: string;
  forChild: boolean;
}

// Ported verbatim from motherAppointmentsMockData.ts's motherAppointments
// (mapt_01..13) — the richer, canonical appointment history for Ananya; the
// doctor-side mock's doctorAppointments only carries one overlapping entry
// (apt_01) for her since it's a per-doctor dashboard view onto the same
// underlying appointment, not a second dataset.
const APPOINTMENT_SEEDS: AppointmentSeed[] = [
  { category: 'POSTNATAL_CHECKUP', title: '6-Week Postpartum & Pediatric Checkup', date: '2026-08-29', time: '10:30 AM', location: 'OPD Block A, Room 204', reason: "Routine checkup for maternal recovery and baby Vihaan's 6-week growth screening.", status: 'upcoming', notes: 'Bring vaccination card and recent feeding log.', forChild: true },
  { category: 'VACCINATION', title: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1', date: '2026-08-29', time: '11:15 AM', location: 'Pediatric Wing', reason: "6-week routine immunization for Vihaan.", status: 'upcoming', forChild: true },
  { category: 'LAB_TEST', title: 'Postpartum CBC & Iron Panel', date: '2026-09-05', time: '09:00 AM', location: 'Diagnostics Lab, Ground Floor', reason: 'Follow-up blood work to confirm iron levels are recovering after delivery.', status: 'upcoming', forChild: false },
  { category: 'PEDIATRIC_CHECKUP', title: '10-Week Pediatric Growth Review', date: '2026-09-26', time: '10:00 AM', location: 'Pediatric Wing', reason: 'Requested growth and feeding check-in ahead of the 10-week vaccination visit.', status: 'requested', forChild: true },
  { category: 'PEDIATRIC_CHECKUP', title: 'Newborn 2-Week Neonatal Check', date: '2026-08-01', time: '11:00 AM', location: 'Pediatric Wing', reason: 'Newborn weight, jaundice, and feeding assessment.', status: 'completed', forChild: true },
  { category: 'VACCINATION', title: 'BCG, OPV-0, Hepatitis B-1', date: '2026-07-19', time: '09:30 AM', location: 'Pediatric Wing', reason: 'Birth-dose immunization for Vihaan.', status: 'completed', forChild: true },
  { category: 'ANTENATAL_CHECKUP', title: '38-Week Antenatal Review', date: '2026-07-14', time: '04:00 PM', location: 'OPD Block A, Room 204', reason: 'Final antenatal review ahead of expected delivery.', status: 'completed', forChild: false },
  { category: 'ULTRASOUND_SCAN', title: 'Growth Scan - 35 Weeks', date: '2026-06-28', time: '09:00 AM', location: 'Radiology Suite', reason: 'Estimated fetal weight and amniotic fluid check.', status: 'completed', forChild: false },
  { category: 'LAB_TEST', title: 'Glucose Tolerance Test (GTT)', date: '2026-06-10', time: '08:30 AM', location: 'Diagnostics Lab, Ground Floor', reason: 'Gestational diabetes screening.', status: 'completed', forChild: false },
  { category: 'ULTRASOUND_SCAN', title: 'Anomaly Scan - 20 Weeks', date: '2026-04-20', time: '10:00 AM', location: 'Radiology Suite', reason: 'Detailed fetal anomaly screening.', status: 'completed', forChild: false },
  { category: 'ANTENATAL_CHECKUP', title: 'First Trimester Registration Visit', date: '2026-02-05', time: '11:30 AM', location: 'OPD Block A, Room 204', reason: 'Pregnancy registration and baseline health assessment.', status: 'completed', forChild: false },
  { category: 'LAB_TEST', title: 'Routine Urine Protein Test', date: '2026-07-05', time: '09:00 AM', location: 'Diagnostics Lab, Ground Floor', reason: 'Routine antenatal screening test.', status: 'cancelled', notes: 'Cancelled — combined with the 38-week antenatal review instead.', forChild: false },
  { category: 'ANTENATAL_CHECKUP', title: '32-Week Antenatal Review', date: '2026-06-01', time: '10:00 AM', location: 'OPD Block A, Room 204', reason: 'Routine antenatal review.', status: 'rescheduled', notes: 'Moved to align with the 35-week growth scan visit.', forChild: false },
];

async function ensureAppointments(
  motherId: string,
  doctorId: string,
  hospitalId: string,
  childId: string | null,
  seeds: AppointmentSeed[]
): Promise<void> {
  for (const a of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM appointments WHERE mother_id = $1 AND title = $2 AND appt_date = $3 AND appt_time = $4',
      [motherId, a.title, a.date, to24Hour(a.time)]
    );
    if (existing.rowCount) continue;
    await pool.query(
      `INSERT INTO appointments (mother_id, child_id, doctor_id, hospital_id, category, title, appt_date, appt_time, location, reason, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [motherId, a.forChild ? childId : null, doctorId, hospitalId, a.category, a.title, a.date, to24Hour(a.time), a.location, a.reason ?? null, a.status, a.notes ?? null]
    );
  }
  console.log(`  appointments: ${seeds.length} seeded/verified`);
}

interface VaccinationSeed {
  code: string;
  vaccineName: string;
  targetAgeDescription: string;
  doseLabel: string;
  recommendedDate: string;
  givenDate?: string;
  status: string;
  location: string;
  notes?: string;
  administeredBy?: string;
  reminderEnabled?: boolean;
  forChild: boolean;
}

// Ported from motherVaccinationsMockData.ts's motherVaccinations (mvac_01..08).
// vaccine_catalog has no row per mock entry (it's a lookup keyed by code, not
// by dose), so each distinct vaccine/dose-milestone gets its own catalog code
// — e.g. Pentavalent-1 and Pentavalent-2 are different codes, matching how
// the mock already treats them as different named doses.
const VACCINATION_SEEDS: VaccinationSeed[] = [
  { code: 'TT1', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 1 of 2', doseLabel: 'Dose 1 of 2', recommendedDate: '2026-02-05', givenDate: '2026-02-05', status: 'completed', location: 'OPD Block A, Room 204', notes: 'Given at first-trimester registration visit.', administeredBy: 'Dr. Priya Menon', forChild: false },
  { code: 'TT2', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 2 of 2', doseLabel: 'Dose 2 of 2', recommendedDate: '2026-03-05', givenDate: '2026-03-05', status: 'completed', location: 'OPD Block A, Room 204', notes: 'Second dose given four weeks after TT-1, as per antenatal schedule.', forChild: false },
  { code: 'FLU_ANTENATAL', vaccineName: 'Influenza (Flu) Vaccine', targetAgeDescription: 'Antenatal Dose', doseLabel: 'Antenatal Dose', recommendedDate: '2026-05-15', status: 'overdue', location: 'OPD Block A, Room 204', notes: 'Recommended anytime during pregnancy for maternal and newborn protection. Catch-up dose still advised postpartum — please discuss with your doctor.', reminderEnabled: true, forChild: false },
  { code: 'BCG_OPV0_HEPB1', vaccineName: 'BCG, OPV-0, Hepatitis B-1', targetAgeDescription: 'Birth Dose', doseLabel: 'Birth Dose', recommendedDate: '2026-07-18', givenDate: '2026-07-19', status: 'completed', location: 'Pediatric Wing', notes: 'Administered a day after birth, as per newborn protocol.', administeredBy: 'Sunrise Hospital Care Team', forChild: true },
  { code: 'PENTA1_OPV1_ROTA1_PCV1', vaccineName: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1', targetAgeDescription: '6 Weeks', doseLabel: '6 Weeks', recommendedDate: '2026-08-29', status: 'due_soon', location: 'Pediatric Wing', notes: 'Scheduled alongside the 6-week postpartum & pediatric checkup.', reminderEnabled: true, forChild: true },
  { code: 'PENTA2_OPV2_ROTA2', vaccineName: 'Pentavalent-2, OPV-2, Rotavirus-2', targetAgeDescription: '10 Weeks', doseLabel: '10 Weeks', recommendedDate: '2026-09-26', status: 'upcoming', location: 'Pediatric Wing', forChild: true },
  { code: 'PENTA3_OPV3_PCV2', vaccineName: 'Pentavalent-3, OPV-3, PCV-2', targetAgeDescription: '14 Weeks', doseLabel: '14 Weeks', recommendedDate: '2026-10-24', status: 'upcoming', location: 'Pediatric Wing', forChild: true },
  { code: 'MR1', vaccineName: 'Measles-Rubella (MR-1)', targetAgeDescription: '9 Months', doseLabel: '9 Months', recommendedDate: '2027-04-18', status: 'upcoming', location: 'Pediatric Wing', forChild: true },
];

async function ensureVaccineCatalogEntry(code: string, name: string, targetAgeDescription: string): Promise<void> {
  await pool.query(
    `INSERT INTO vaccine_catalog (code, name, target_age_description) VALUES ($1, $2, $3)
     ON CONFLICT (code) DO NOTHING`,
    [code, name, targetAgeDescription]
  );
}

async function ensureVaccinations(
  motherId: string,
  doctorId: string,
  hospitalId: string,
  childId: string | null,
  seeds: VaccinationSeed[]
): Promise<void> {
  for (const v of seeds) {
    await ensureVaccineCatalogEntry(v.code, v.vaccineName, v.targetAgeDescription);

    const existing = await pool.query(
      'SELECT 1 FROM vaccinations WHERE mother_id = $1 AND vaccine_code = $2 AND dose_label = $3',
      [motherId, v.code, v.doseLabel]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO vaccinations (mother_id, child_id, doctor_id, hospital_id, recipient_type, vaccine_code, dose_label, recommended_date, given_date, status, location, administered_by, notes, reminder_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        motherId,
        v.forChild ? childId : null,
        doctorId,
        hospitalId,
        v.forChild ? 'CHILD' : 'MOTHER',
        v.code,
        v.doseLabel,
        v.recommendedDate,
        v.givenDate ?? null,
        v.status,
        v.location,
        v.administeredBy ?? null,
        v.notes ?? null,
        v.reminderEnabled ?? true,
      ]
    );
  }
  console.log(`  vaccinations: ${seeds.length} seeded/verified`);
}

interface GrowthSeed {
  recipientType: 'MOTHER' | 'CHILD';
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  context: string;
  notes?: string;
}

// Ported from motherGrowthMockData.ts's motherGrowthMeasurements (mgrw_01..08).
const GROWTH_SEEDS: GrowthSeed[] = [
  { recipientType: 'MOTHER', date: '2026-02-05', weightKg: 58.0, context: 'First-trimester registration baseline' },
  { recipientType: 'MOTHER', date: '2026-04-20', weightKg: 61.5, context: '20-week anomaly scan visit' },
  { recipientType: 'MOTHER', date: '2026-06-28', weightKg: 65.4, context: '35-week growth scan visit' },
  { recipientType: 'MOTHER', date: '2026-07-14', weightKg: 68.2, context: '38-week final antenatal review', notes: 'Healthy total gestational weight gain, within expected range.' },
  { recipientType: 'MOTHER', date: '2026-08-01', weightKg: 63.5, context: '2-week postpartum check', notes: 'Normal early postpartum weight loss, recovery on track.' },
  { recipientType: 'CHILD', date: '2026-07-18', weightKg: 3.2, heightCm: 49, headCircumferenceCm: 34, context: 'Birth measurements' },
  { recipientType: 'CHILD', date: '2026-08-01', weightKg: 3.6, heightCm: 50.5, headCircumferenceCm: 35, context: 'Newborn 2-week neonatal check' },
  { recipientType: 'CHILD', date: '2026-08-20', weightKg: 4.1, heightCm: 53, headCircumferenceCm: 36.5, context: 'Routine growth check-in', notes: 'Feeding well, weight gain tracking steadily along the expected curve.' },
];

async function ensureGrowthMeasurements(
  motherId: string,
  doctorId: string,
  hospitalId: string,
  childId: string | null,
  seeds: GrowthSeed[]
): Promise<void> {
  for (const g of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM growth_measurements WHERE mother_id = $1 AND recipient_type = $2 AND measured_on = $3',
      [motherId, g.recipientType, g.date]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO growth_measurements (mother_id, child_id, doctor_id, hospital_id, recipient_type, measured_on, weight_kg, height_cm, head_circumference_cm, context, notes, logged_by_mother)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false)`,
      [
        motherId,
        g.recipientType === 'CHILD' ? childId : null,
        doctorId,
        hospitalId,
        g.recipientType,
        g.date,
        g.weightKg ?? null,
        g.heightCm ?? null,
        g.headCircumferenceCm ?? null,
        g.context,
        g.notes ?? null,
      ]
    );
  }
  console.log(`  growth measurements: ${seeds.length} seeded/verified`);
}

interface MilestoneSeed {
  recipientType: 'MOTHER' | 'CHILD';
  category: string;
  title: string;
  description: string;
  targetAgeRange: string;
  status: string;
  achievedDate?: string;
  notes?: string;
}

// Ported from motherGrowthMockData.ts's motherMilestones (mms_01..08).
const MILESTONE_SEEDS: MilestoneSeed[] = [
  { recipientType: 'MOTHER', category: 'MATERNAL_RECOVERY', title: 'Perineal/postpartum healing review', description: 'Initial recovery check confirming healing is progressing normally after a normal delivery.', targetAgeRange: '2 Weeks Postpartum', status: 'achieved', achievedDate: '2026-08-01', notes: 'Reviewed and confirmed by Dr. Priya Menon at the 2-week postpartum check.' },
  { recipientType: 'MOTHER', category: 'MATERNAL_RECOVERY', title: '6-week postpartum recovery review', description: 'Full recovery check-up including physical exam and family planning discussion.', targetAgeRange: '6 Weeks Postpartum', status: 'due_soon', notes: 'Scheduled alongside the 6-week postpartum & pediatric checkup on 2026-08-29.' },
  { recipientType: 'MOTHER', category: 'MATERNAL_RECOVERY', title: 'Cleared for light exercise', description: 'Doctor clearance to gradually resume light physical activity and walking routines.', targetAgeRange: '6-8 Weeks Postpartum', status: 'upcoming' },
  { recipientType: 'CHILD', category: 'MOTOR', title: 'Lifts head briefly during tummy time', description: 'Vihaan can briefly lift and hold his head up while lying on his tummy.', targetAgeRange: 'By 4-6 Weeks', status: 'achieved', achievedDate: '2026-08-15' },
  { recipientType: 'CHILD', category: 'SOCIAL', title: 'Begins to smile responsively', description: 'Starting to smile in response to your voice or face, not just reflexively.', targetAgeRange: '6-8 Weeks', status: 'due_soon' },
  { recipientType: 'CHILD', category: 'COGNITIVE', title: 'Follows objects with eyes', description: 'Tracks a moving object or face with his eyes across his field of view.', targetAgeRange: 'By 8 Weeks', status: 'due_soon' },
  { recipientType: 'CHILD', category: 'LANGUAGE', title: 'Coos and makes vowel sounds', description: 'Begins making soft cooing sounds in response to interaction.', targetAgeRange: '2-3 Months', status: 'upcoming' },
  { recipientType: 'CHILD', category: 'MOTOR', title: 'Holds head steady when upright', description: 'Can hold his head steady and upright without support for short periods.', targetAgeRange: '3-4 Months', status: 'upcoming' },
];

async function ensureMilestones(motherId: string, childId: string | null, seeds: MilestoneSeed[]): Promise<void> {
  for (const m of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM milestones WHERE mother_id = $1 AND recipient_type = $2 AND title = $3',
      [motherId, m.recipientType, m.title]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO milestones (mother_id, child_id, recipient_type, category, title, description, target_age_range, status, achieved_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        motherId,
        m.recipientType === 'CHILD' ? childId : null,
        m.recipientType,
        m.category,
        m.title,
        m.description,
        m.targetAgeRange,
        m.status,
        m.achievedDate ?? null,
        m.notes ?? null,
      ]
    );
  }
  console.log(`  milestones: ${seeds.length} seeded/verified`);
}

interface DailyGoalSeed {
  category: string;
  title: string;
  targetLabel: string;
  targetCount: number;
  completedCount: number;
}

// Ported from motherNutritionMockData.ts's motherDailyGoals (goal_01..04).
// goal_date is intentionally left to the column's own DEFAULT CURRENT_DATE
// instead of a literal string: dailyGoalService.ts's listMyDailyGoals()
// filters on `goal_date = CURRENT_DATE`, so inserting with the same DB-side
// CURRENT_DATE the query uses is what keeps "today" correct regardless of
// which real calendar day the seed happens to run on — a hardcoded date
// would go stale and silently vanish from the query the next day.
const DAILY_GOAL_SEEDS: DailyGoalSeed[] = [
  { category: 'HYDRATION', title: 'Water Intake', targetLabel: '8 glasses', targetCount: 8, completedCount: 3 },
  { category: 'NUTRITION', title: 'Protein-Rich Meals', targetLabel: '3 servings', targetCount: 3, completedCount: 1 },
  { category: 'ACTIVITY', title: 'Gentle Walk', targetLabel: '15 minutes', targetCount: 1, completedCount: 0 },
  { category: 'REST', title: 'Rest Breaks', targetLabel: '2 breaks', targetCount: 2, completedCount: 1 },
];

// Existence/idempotency key matches the table's own UNIQUE(mother_id,
// category, goal_date) constraint.
async function ensureDailyGoals(motherId: string, seeds: DailyGoalSeed[]): Promise<void> {
  for (const g of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM daily_goals WHERE mother_id = $1 AND category = $2 AND goal_date = CURRENT_DATE',
      [motherId, g.category]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO daily_goals (mother_id, category, title, target_label, target_count, completed_count)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [motherId, g.category, g.title, g.targetLabel, g.targetCount, g.completedCount]
    );
  }
  console.log(`  daily goals: ${seeds.length} seeded/verified`);
}

interface NutritionReminderSeed {
  title: string;
  description: string;
  timing: string;
  enabled: boolean;
}

// Ported from motherNutritionMockData.ts's motherNutritionReminders (rem_01..04).
const NUTRITION_REMINDER_SEEDS: NutritionReminderSeed[] = [
  { title: 'Take Iron & Folic Acid + Calcium', description: 'Take with food, ideally with a source of Vitamin C to aid absorption.', timing: 'After breakfast', enabled: true },
  { title: 'Drink Water Before Every Feed', description: 'Keeping a water bottle within reach makes it easier to stay hydrated while nursing.', timing: 'Every feed', enabled: true },
  { title: 'Take Postnatal Multivitamin', description: 'Supports nutrient recovery during breastfeeding.', timing: 'Morning', enabled: true },
  { title: 'Stretch or Take a Short Walk', description: 'A short gentle walk or stretch break to support circulation and mood.', timing: 'Afternoon', enabled: false },
];

async function ensureNutritionReminders(motherId: string, seeds: NutritionReminderSeed[]): Promise<void> {
  for (const r of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM nutrition_reminders WHERE mother_id = $1 AND title = $2',
      [motherId, r.title]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO nutrition_reminders (mother_id, title, description, timing, enabled)
       VALUES ($1, $2, $3, $4, $5)`,
      [motherId, r.title, r.description, r.timing, r.enabled]
    );
  }
  console.log(`  nutrition reminders: ${seeds.length} seeded/verified`);
}

interface MedicationSeed {
  name: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  instructions?: string;
  caution?: string;
  forChild: boolean;
}

// medications (migration 002) has no seed producer yet — ported from
// doctorPatientsMockData.ts's doctorMedications (med_01..04), keyed on
// (mother_id, name, start_date) so re-running never duplicates a dose.
async function ensureMedications(
  motherId: string,
  doctorId: string,
  hospitalId: string,
  childId: string | null,
  seeds: MedicationSeed[]
): Promise<void> {
  for (const m of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM medications WHERE mother_id = $1 AND name = $2 AND start_date IS NOT DISTINCT FROM $3',
      [motherId, m.name, m.startDate ?? null]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO medications (mother_id, child_id, doctor_id, hospital_id, name, dosage, frequency, timing, start_date, end_date, status, instructions, caution)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        motherId,
        m.forChild ? childId : null,
        doctorId,
        hospitalId,
        m.name,
        m.dosage ?? null,
        m.frequency ?? null,
        m.timing ?? null,
        m.startDate ?? null,
        m.endDate ?? null,
        m.status,
        m.instructions ?? null,
        m.caution ?? null,
      ]
    );
  }
  if (seeds.length) console.log(`  medications: ${seeds.length} seeded/verified`);
}

interface CareRecommendationSeed {
  type: string;
  title: string;
  description: string;
  date: string;
}

// Ported from doctorPatientsMockData.ts's doctorRecommendations.
async function ensureCareRecommendations(pcrId: string, doctorId: string, seeds: CareRecommendationSeed[]): Promise<void> {
  for (const r of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM care_recommendations WHERE patient_care_record_id = $1 AND title = $2',
      [pcrId, r.title]
    );
    if (existing.rowCount) continue;
    await pool.query(
      `INSERT INTO care_recommendations (patient_care_record_id, doctor_id, type, title, description, rec_date, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [pcrId, doctorId, r.type, r.title, r.description, r.date]
    );
  }
  if (seeds.length) console.log(`  care recommendations: ${seeds.length} seeded/verified`);
}

interface ConsultationNoteSeed {
  date: string;
  title: string;
  note: string;
}

// Ported from doctorPatientsMockData.ts's doctorConsultationNotes.
async function ensureConsultationNotes(pcrId: string, doctorId: string, seeds: ConsultationNoteSeed[]): Promise<void> {
  for (const n of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM consultation_notes WHERE patient_care_record_id = $1 AND note_date = $2 AND title = $3',
      [pcrId, n.date, n.title]
    );
    if (existing.rowCount) continue;
    await pool.query(
      `INSERT INTO consultation_notes (patient_care_record_id, doctor_id, note_date, title, note, visible_to_patient)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [pcrId, doctorId, n.date, n.title, n.note]
    );
  }
  if (seeds.length) console.log(`  consultation notes: ${seeds.length} seeded/verified`);
}

interface DocumentSeed {
  name: string;
  category: string;
  date: string;
  status: string;
  description: string;
  fileSize?: string;
  fileType?: string;
}

// Ported from reportsMockData.ts's mockReports (R001..R010) and
// doctorPatientsMockData.ts's doctorReports (R101..R109) — the same records
// doctorPatientsMockData.ts reuses for the doctor-side view, not a second
// dataset. These are backfilled historical/demo records, not files a doctor
// actually uploaded through the app — so unlike a real upload (see
// documentService.ts), there is no binary file on disk and file_url is left
// NULL; file_size/file_type are only populated where the mock specifies them.
const DOCUMENT_SEEDS: DocumentSeed[] = [
  { name: 'Second Trimester Ultrasound Scan', category: 'ULTRASOUND', date: '2026-02-14', status: 'COMPLETED', description: 'Detailed 20-week anatomy scan showing normal fetal development.', fileSize: '8.5 MB', fileType: 'PDF' },
  { name: 'Complete Blood Count (CBC)', category: 'BLOOD_TEST', date: '2026-01-28', status: 'COMPLETED', description: 'Antenatal blood work - all values within normal range.', fileSize: '1.2 MB', fileType: 'PDF' },
  { name: 'Glucose Tolerance Test (GTT)', category: 'BLOOD_TEST', date: '2026-03-10', status: 'COMPLETED', description: 'Gestational diabetes screening - normal result.', fileSize: '2.1 MB', fileType: 'PDF' },
  { name: 'Prenatal Vitamins Prescription', category: 'PRESCRIPTION', date: '2026-01-24', status: 'COMPLETED', description: 'Iron supplements, folic acid, and prenatal multivitamins.', fileSize: '0.8 MB', fileType: 'PDF' },
  { name: 'Third Trimester Ultrasound', category: 'ULTRASOUND', date: '2026-06-05', status: 'COMPLETED', description: 'Growth monitoring and fetal position assessment at 32 weeks.', fileSize: '9.2 MB', fileType: 'PDF' },
  { name: 'Hospital Discharge Summary (Delivery)', category: 'OTHER', date: '2026-07-18', status: 'COMPLETED', description: 'Postpartum discharge summary following normal delivery of baby boy.', fileSize: '1.5 MB', fileType: 'PDF' },
  { name: 'Postpartum Checkup Results', category: 'BLOOD_TEST', date: '2026-08-01', status: 'COMPLETED', description: 'Two-week postpartum checkup - mother recovering well.', fileSize: '1.8 MB', fileType: 'PDF' },
  { name: 'Postpartum Medication Prescription', category: 'PRESCRIPTION', date: '2026-07-20', status: 'COMPLETED', description: 'Pain management and recovery medications.', fileSize: '0.6 MB', fileType: 'PDF' },
  { name: 'Six-Week Postpartum Review', category: 'OTHER', date: '2026-08-29', status: 'UPCOMING', description: 'Scheduled comprehensive postpartum health review.' },
  { name: 'Breast Health Assessment', category: 'OTHER', date: '2026-08-25', status: 'PENDING', description: 'Lactation support and breast health screening.' },
];

async function ensureDocuments(motherId: string, pcrId: string, doctorId: string, hospitalId: string, seeds: DocumentSeed[]): Promise<void> {
  for (const d of seeds) {
    const existing = await pool.query(
      'SELECT 1 FROM documents WHERE mother_id = $1 AND name = $2 AND doc_date = $3',
      [motherId, d.name, d.date]
    );
    if (existing.rowCount) continue;

    await pool.query(
      `INSERT INTO documents (mother_id, patient_care_record_id, uploaded_by_user_id, hospital_id, name, category, doc_date, status, description, file_size, file_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [motherId, pcrId, doctorId, hospitalId, d.name, d.category, d.date, d.status, d.description, d.fileSize ?? null, d.fileType ?? null]
    );
  }
  console.log(`  documents: ${seeds.length} seeded/verified`);
}

// ---------------------------------------------------------------------------
// Additional mothers — Dr. Priya Menon's fuller roster, and a second doctor
// with a fully separate roster, so the demo shows multiple patients per
// doctor, both antenatal and postnatal, and proves doctor-to-doctor
// isolation. Ported from doctorPatientsMockData.ts's doctorPatients (pat_02
// through pat_09) plus its matching appointments/reports/medications/
// recommendations/consultation notes, with two invented mothers
// (Priyanka Shah, Sana Khan) added to the second doctor so both doctors have
// a mix of antenatal and postnatal patients.
// ---------------------------------------------------------------------------

interface MotherScenario {
  email: string;
  name: string;
  phone: string;
  age: number;
  bloodGroup: string;
  location: string;
  motherStage: 'pregnancy' | 'postpartum';
  pregnancyWeek?: number;
  deliveryDate?: string;
  emergencyContact: { name: string; relation: string; phone: string };
  child?: ChildSeed;
  care: CareAssignmentSeed;
  appointments: AppointmentSeed[];
  vaccinations: VaccinationSeed[];
  growth: GrowthSeed[];
  milestones: MilestoneSeed[];
  medications: MedicationSeed[];
  careRecommendations: CareRecommendationSeed[];
  consultationNotes: ConsultationNoteSeed[];
  documents: DocumentSeed[];
}

async function seedMother(hospitalId: string, doctorId: string, s: MotherScenario): Promise<void> {
  console.log(`Seeding mother: ${s.name}`);
  const motherId = await ensureUser(s.email, s.name, 'mother', s.phone, {
    age: s.age,
    stage: s.motherStage,
    pregnancyWeek: s.pregnancyWeek,
    deliveryDate: s.deliveryDate,
    bloodGroup: s.bloodGroup,
    location: s.location,
  });

  await upsertPrimaryEmergencyContact(motherId, s.emergencyContact);

  let childId: string | null = null;
  if (s.child) {
    childId = await ensureNamedChild(motherId, hospitalId, s.child);
  }

  const pcrId = await ensureCareAssignmentFull(motherId, doctorId, hospitalId, childId, s.care);

  await ensureAppointments(motherId, doctorId, hospitalId, childId, s.appointments);
  await ensureVaccinations(motherId, doctorId, hospitalId, childId, s.vaccinations);
  await ensureGrowthMeasurements(motherId, doctorId, hospitalId, childId, s.growth);
  await ensureMilestones(motherId, childId, s.milestones);
  await ensureMedications(motherId, doctorId, hospitalId, childId, s.medications);
  await ensureCareRecommendations(pcrId, doctorId, s.careRecommendations);
  await ensureConsultationNotes(pcrId, doctorId, s.consultationNotes);
  await ensureDocuments(motherId, pcrId, doctorId, hospitalId, s.documents);
}

// --- Dr. Priya Menon's additional roster (@ Sunrise Women & Children Hospital) ---

const PRIYA_ADDITIONAL_MOTHERS: MotherScenario[] = [
  {
    // pat_02
    email: 'meera.iyer@example.com',
    name: 'Meera Iyer',
    phone: '+91 98450 11223',
    age: 29,
    bloodGroup: 'B+',
    location: 'Koramangala, Bengaluru',
    motherStage: 'pregnancy',
    pregnancyWeek: 28,
    emergencyContact: { name: 'Karthik Iyer', relation: 'Spouse', phone: '+91 98450 11224' },
    care: {
      stage: 'ANTENATAL',
      status: 'FOLLOW_UP_DUE',
      riskLevel: 'MODERATE',
      pregnancyWeek: 28,
      expectedDeliveryDate: '2026-11-02',
      gravida: 'G1P0',
      ancVisitsCompleted: 5,
      ancVisitsPlanned: 8,
      highRiskFactors: ['Gestational diabetes under monitoring'],
      lastVisitDate: '2026-08-10',
      registeredOn: '2026-04-12',
    },
    appointments: [
      { category: 'ANTENATAL_CHECKUP', title: '28-Week Antenatal & GDM Review', date: '2026-08-23', time: '10:00 AM', location: 'OPD Block A, Room 204', reason: 'Gestational diabetes monitoring review.', status: 'upcoming', forChild: false },
      { category: 'LAB_TEST', title: 'Glucose Tolerance Test (GTT) Review', date: '2026-08-10', time: '10:30 AM', location: 'OPD Block A, Room 204', reason: 'Glucose tolerance test results reviewed.', status: 'completed', forChild: false },
    ],
    vaccinations: [
      { code: 'TT1', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 1 of 2', doseLabel: 'Dose 1 of 2', recommendedDate: '2026-04-12', givenDate: '2026-04-12', status: 'completed', location: 'OPD Block A, Room 204', forChild: false },
    ],
    growth: [
      { recipientType: 'MOTHER', date: '2026-04-12', weightKg: 64.0, context: 'First antenatal registration visit' },
      { recipientType: 'MOTHER', date: '2026-08-10', weightKg: 71.5, context: '28-week GDM review visit' },
    ],
    milestones: [],
    medications: [
      { name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily, with meals', startDate: '2026-08-10', status: 'active', instructions: 'For gestational diabetes management; reassess at next visit.', forChild: false },
    ],
    careRecommendations: [
      { type: 'NUTRITION', title: 'Gestational diabetes diet control', description: 'Low glycemic-index meals, portion control, and a 20-minute post-meal walk to support blood sugar management.', date: '2026-08-10' },
    ],
    consultationNotes: [
      { date: '2026-08-10', title: 'GTT results discussion', note: 'Discussed mildly elevated fasting glucose. Started on diet control and metformin, review in 2 weeks.' },
    ],
    documents: [
      { name: 'Glucose Tolerance Test (GTT) - 28 Weeks', category: 'BLOOD_TEST', date: '2026-08-10', status: 'COMPLETED', description: 'Gestational diabetes screening - mildly elevated fasting glucose, diet control advised.', fileSize: '1.4 MB', fileType: 'PDF' },
      { name: 'Antenatal Ultrasound - 24 Weeks', category: 'ULTRASOUND', date: '2026-07-15', status: 'COMPLETED', description: 'Fetal growth within expected range for gestational age.', fileSize: '7.8 MB', fileType: 'PDF' },
    ],
  },
  {
    // pat_03
    email: 'fatima.sheikh@example.com',
    name: 'Fatima Sheikh',
    phone: '+91 90080 33445',
    age: 26,
    bloodGroup: 'A+',
    location: 'Frazer Town, Bengaluru',
    motherStage: 'pregnancy',
    pregnancyWeek: 12,
    emergencyContact: { name: 'Imran Sheikh', relation: 'Spouse', phone: '+91 90080 33446' },
    care: {
      stage: 'ANTENATAL',
      status: 'STABLE',
      riskLevel: 'LOW',
      pregnancyWeek: 12,
      expectedDeliveryDate: '2027-02-15',
      gravida: 'G2P1',
      ancVisitsCompleted: 1,
      ancVisitsPlanned: 8,
      highRiskFactors: [],
      lastVisitDate: '2026-08-05',
      registeredOn: '2026-07-20',
    },
    appointments: [
      { category: 'ANTENATAL_CHECKUP', title: 'First Trimester Registration Visit', date: '2026-08-05', time: '09:00 AM', location: 'OPD Block A, Room 204', reason: 'Pregnancy registration and baseline health assessment.', status: 'completed', forChild: false },
      { category: 'ANTENATAL_CHECKUP', title: '16-Week Antenatal Checkup', date: '2026-08-27', time: '04:00 PM', location: 'OPD Block A, Room 204', reason: 'Routine antenatal review.', status: 'upcoming', forChild: false },
    ],
    vaccinations: [],
    growth: [
      { recipientType: 'MOTHER', date: '2026-08-05', weightKg: 55.0, context: 'First-trimester registration baseline' },
    ],
    milestones: [],
    medications: [],
    careRecommendations: [
      { type: 'GENERAL', title: 'First-trimester care guidance', description: 'Folic acid supplementation, avoid raw/undercooked foods, and schedule the next antenatal visit at 16 weeks.', date: '2026-08-05' },
    ],
    consultationNotes: [
      { date: '2026-08-05', title: 'First antenatal registration visit', note: 'Registered for antenatal care. Folic acid and prenatal vitamins started; next visit scheduled at 16 weeks.' },
    ],
    documents: [
      { name: 'Registration Blood Panel', category: 'BLOOD_TEST', date: '2026-08-05', status: 'COMPLETED', description: 'First-trimester baseline blood work - all values normal.', fileSize: '1.1 MB', fileType: 'PDF' },
    ],
  },
  {
    // pat_04
    email: 'kavya.reddy@example.com',
    name: 'Kavya Reddy',
    phone: '+91 97400 55667',
    age: 31,
    bloodGroup: 'O-',
    location: 'HSR Layout, Bengaluru',
    motherStage: 'pregnancy',
    pregnancyWeek: 36,
    emergencyContact: { name: 'Sanjay Reddy', relation: 'Spouse', phone: '+91 97400 55668' },
    care: {
      stage: 'ANTENATAL',
      status: 'REPORT_PENDING',
      riskLevel: 'HIGH',
      pregnancyWeek: 36,
      expectedDeliveryDate: '2026-09-10',
      gravida: 'G1P0',
      ancVisitsCompleted: 7,
      ancVisitsPlanned: 8,
      highRiskFactors: ['Pre-eclampsia watch', 'Elevated blood pressure at last visit'],
      lastVisitDate: '2026-08-18',
      registeredOn: '2026-02-02',
    },
    appointments: [
      { category: 'ANTENATAL_CHECKUP', title: 'Blood Pressure & Pre-eclampsia Review', date: '2026-08-23', time: '12:30 PM', location: 'OPD Block A, Room 206', reason: 'Blood pressure & pre-eclampsia review.', status: 'upcoming', forChild: false },
      { category: 'ULTRASOUND_SCAN', title: 'Growth Scan Ultrasound - 35 Weeks', date: '2026-08-18', time: '09:00 AM', location: 'Radiology Suite', reason: 'Estimated fetal weight and amniotic fluid check.', status: 'completed', forChild: false },
    ],
    vaccinations: [
      { code: 'TT1', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 1 of 2', doseLabel: 'Dose 1 of 2', recommendedDate: '2026-02-02', givenDate: '2026-02-02', status: 'completed', location: 'OPD Block A, Room 204', forChild: false },
      { code: 'TT2', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 2 of 2', doseLabel: 'Dose 2 of 2', recommendedDate: '2026-03-02', givenDate: '2026-03-02', status: 'completed', location: 'OPD Block A, Room 204', forChild: false },
    ],
    growth: [
      { recipientType: 'MOTHER', date: '2026-02-02', weightKg: 60.0, context: 'First-trimester registration baseline' },
      { recipientType: 'MOTHER', date: '2026-08-18', weightKg: 74.8, context: '35-week growth scan visit', notes: 'Elevated blood pressure noted, monitoring for pre-eclampsia.' },
    ],
    milestones: [],
    medications: [
      { name: 'Labetalol', dosage: '100 mg', frequency: 'Twice daily', startDate: '2026-08-18', status: 'active', instructions: 'Blood pressure management, monitor closely for pre-eclampsia signs.', forChild: false },
    ],
    careRecommendations: [
      { type: 'LIFESTYLE', title: 'Low-sodium diet & relative bed rest', description: 'Reduce salt intake, monitor for headaches or visual disturbances, and rest with legs elevated given elevated BP readings.', date: '2026-08-18' },
    ],
    consultationNotes: [
      { date: '2026-08-18', title: 'BP review at 36 weeks', note: 'BP 142/92, mild ankle oedema noted. Started labetalol, urine protein test ordered, close monitoring advised.' },
    ],
    documents: [
      { name: 'BP & Urine Protein Test - 36 Weeks', category: 'BLOOD_TEST', date: '2026-08-20', status: 'PENDING', description: 'Uploaded ahead of pre-eclampsia review, awaiting doctor sign-off.' },
      { name: 'Growth Scan Ultrasound - 35 Weeks', category: 'ULTRASOUND', date: '2026-08-18', status: 'COMPLETED', description: 'Estimated fetal weight within range, amniotic fluid normal.', fileSize: '8.1 MB', fileType: 'PDF' },
    ],
  },
  {
    // pat_05
    email: 'sneha.joshi@example.com',
    name: 'Sneha Joshi',
    phone: '+91 99001 22884',
    age: 33,
    bloodGroup: 'AB+',
    location: 'Jayanagar, Bengaluru',
    motherStage: 'postpartum',
    deliveryDate: '2026-06-02',
    emergencyContact: { name: 'Aditya Joshi', relation: 'Spouse', phone: '+91 99001 22885' },
    child: { name: 'Aarav Joshi', gender: 'boy', dateOfBirth: '2026-06-02', birthWeightKg: 2.9, currentWeightKg: 4.6, bloodGroup: 'AB+' },
    care: {
      stage: 'POSTNATAL',
      status: 'STABLE',
      riskLevel: 'LOW',
      deliveryDate: '2026-06-02',
      deliveryType: 'C-Section',
      postpartumWeeks: 11,
      recoveryStatus: 'Surgical wound healing well, no signs of infection.',
      breastfeedingStatus: 'Mixed feeding, latch improving.',
      lastVisitDate: '2026-08-15',
      registeredOn: '2025-11-20',
    },
    appointments: [
      { category: 'POSTNATAL_CHECKUP', title: '11-Week Postnatal Checkup', date: '2026-08-15', time: '10:00 AM', location: 'OPD Block A, Room 204', status: 'completed', forChild: false },
      { category: 'PEDIATRIC_CHECKUP', title: '10-Week Pediatric Growth Review', date: '2026-08-15', time: '10:30 AM', location: 'Pediatric Wing', status: 'completed', forChild: true },
    ],
    vaccinations: [
      { code: 'BCG_OPV0_HEPB1', vaccineName: 'BCG, OPV-0, Hepatitis B-1', targetAgeDescription: 'Birth Dose', doseLabel: 'Birth Dose', recommendedDate: '2026-06-02', givenDate: '2026-06-03', status: 'completed', location: 'Pediatric Wing', administeredBy: 'Sunrise Hospital Care Team', forChild: true },
      { code: 'PENTA1_OPV1_ROTA1_PCV1', vaccineName: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1', targetAgeDescription: '6 Weeks', doseLabel: '6 Weeks', recommendedDate: '2026-07-14', givenDate: '2026-07-14', status: 'completed', location: 'Pediatric Wing', forChild: true },
      { code: 'PENTA2_OPV2_ROTA2', vaccineName: 'Pentavalent-2, OPV-2, Rotavirus-2', targetAgeDescription: '10 Weeks', doseLabel: '10 Weeks', recommendedDate: '2026-08-25', status: 'due_soon', location: 'Pediatric Wing', reminderEnabled: true, forChild: true },
    ],
    growth: [
      { recipientType: 'CHILD', date: '2026-06-02', weightKg: 2.9, heightCm: 47, headCircumferenceCm: 33, context: 'Birth measurements' },
      { recipientType: 'CHILD', date: '2026-08-15', weightKg: 4.6, heightCm: 55, headCircumferenceCm: 37, context: '10-week pediatric growth review' },
    ],
    milestones: [
      { recipientType: 'CHILD', category: 'MOTOR', title: 'Lifts head briefly during tummy time', description: 'Aarav can briefly lift and hold his head up while lying on his tummy.', targetAgeRange: 'By 4-6 Weeks', status: 'achieved', achievedDate: '2026-07-10' },
      { recipientType: 'CHILD', category: 'SOCIAL', title: 'Begins to smile responsively', description: 'Starting to smile in response to voice or face, not just reflexively.', targetAgeRange: '6-8 Weeks', status: 'achieved', achievedDate: '2026-07-25' },
    ],
    medications: [],
    careRecommendations: [
      { type: 'GENERAL', title: 'Post-operative recovery & wound care', description: 'Keep the surgical site clean and dry, watch for signs of infection, and continue gradual increase in activity as tolerated.', date: '2026-08-15' },
    ],
    consultationNotes: [
      { date: '2026-08-15', title: '11-week postnatal review', note: 'C-section incision healed well. Baby feeding and growing appropriately, mixed feeding latch improving.' },
    ],
    documents: [
      { name: 'C-Section Discharge Summary', category: 'OTHER', date: '2026-06-05', status: 'COMPLETED', description: 'Post-operative discharge summary following C-section delivery.', fileSize: '1.6 MB', fileType: 'PDF' },
    ],
  },
  {
    // pat_07
    email: 'ritika.verma@example.com',
    name: 'Ritika Verma',
    phone: '+91 98220 66112',
    age: 30,
    bloodGroup: 'O+',
    location: 'Malleswaram, Bengaluru',
    motherStage: 'postpartum',
    deliveryDate: '2026-07-30',
    emergencyContact: { name: 'Manish Verma', relation: 'Spouse', phone: '+91 98220 66113' },
    child: { name: 'Anaya Verma', gender: 'girl', dateOfBirth: '2026-07-30', birthWeightKg: 3.0, currentWeightKg: 3.4, bloodGroup: 'O+' },
    care: {
      stage: 'POSTNATAL',
      status: 'FOLLOW_UP_DUE',
      riskLevel: 'MODERATE',
      deliveryDate: '2026-07-30',
      deliveryType: 'Normal',
      postpartumWeeks: 3,
      recoveryStatus: 'Mild fatigue and low iron levels, supplementation started.',
      breastfeedingStatus: 'Exclusive breastfeeding.',
      lastVisitDate: '2026-08-13',
      registeredOn: '2026-01-15',
    },
    appointments: [
      { category: 'POSTNATAL_CHECKUP', title: 'Iron Supplementation & Fatigue Follow-up', date: '2026-08-27', time: '11:30 AM', location: 'OPD Block A, Room 204', reason: 'Iron supplementation & fatigue follow-up.', status: 'upcoming', forChild: false },
      { category: 'PEDIATRIC_CHECKUP', title: 'Newborn 2-Week Neonatal Check', date: '2026-08-13', time: '11:00 AM', location: 'Pediatric Wing', status: 'completed', forChild: true },
    ],
    vaccinations: [
      { code: 'BCG_OPV0_HEPB1', vaccineName: 'BCG, OPV-0, Hepatitis B-1', targetAgeDescription: 'Birth Dose', doseLabel: 'Birth Dose', recommendedDate: '2026-07-30', givenDate: '2026-07-31', status: 'completed', location: 'Pediatric Wing', administeredBy: 'Sunrise Hospital Care Team', forChild: true },
    ],
    growth: [
      { recipientType: 'CHILD', date: '2026-07-30', weightKg: 3.0, heightCm: 48, headCircumferenceCm: 33.5, context: 'Birth measurements' },
    ],
    milestones: [],
    medications: [
      { name: 'Elemental Iron Supplement', dosage: '60 mg', frequency: 'Once daily', startDate: '2026-08-13', status: 'active', instructions: 'For postpartum fatigue and low iron levels.', forChild: false },
    ],
    careRecommendations: [
      { type: 'MEDICATION', title: 'Iron supplementation & rest', description: 'Continue iron tablets with a vitamin C source, prioritize rest between feeds, recheck haemoglobin in 2 weeks.', date: '2026-08-13' },
    ],
    consultationNotes: [
      { date: '2026-08-13', title: '3-week postpartum review', note: 'Mild fatigue and low haemoglobin noted; started iron supplementation, reassess in 2 weeks.' },
    ],
    documents: [
      { name: 'Postpartum CBC', category: 'BLOOD_TEST', date: '2026-08-13', status: 'PENDING', description: 'Uploaded to confirm iron levels after fatigue complaint, awaiting review.' },
    ],
  },
];

// --- Second doctor: Dr. Arjun Nair @ Andheri Care Women & Children Hospital ---

const DOCTOR2_MOTHERS: MotherScenario[] = [
  {
    // pat_09 — the mock's own "must never surface in Dr. Priya Menon's views" case
    email: 'ishita.rao@example.com',
    name: 'Ishita Rao',
    phone: '+91 91234 00998',
    age: 28,
    bloodGroup: 'B+',
    location: 'Andheri, Mumbai',
    motherStage: 'pregnancy',
    pregnancyWeek: 22,
    emergencyContact: { name: 'Rahul Rao', relation: 'Spouse', phone: '+91 91234 00999' },
    care: {
      stage: 'ANTENATAL',
      status: 'STABLE',
      riskLevel: 'LOW',
      pregnancyWeek: 22,
      expectedDeliveryDate: '2026-12-30',
      gravida: 'G1P0',
      ancVisitsCompleted: 3,
      ancVisitsPlanned: 8,
      highRiskFactors: [],
      lastVisitDate: '2026-08-14',
      registeredOn: '2026-04-01',
    },
    appointments: [
      { category: 'ANTENATAL_CHECKUP', title: '22-Week Antenatal Checkup', date: '2026-08-28', time: '11:00 AM', location: 'OPD Block A, Room 101', status: 'upcoming', forChild: false },
      { category: 'ULTRASOUND_SCAN', title: 'Anomaly Scan - 20 Weeks', date: '2026-07-10', time: '10:00 AM', location: 'Radiology Suite', status: 'completed', forChild: false },
    ],
    vaccinations: [
      { code: 'TT1', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 1 of 2', doseLabel: 'Dose 1 of 2', recommendedDate: '2026-04-01', givenDate: '2026-04-01', status: 'completed', location: 'OPD Block A, Room 101', forChild: false },
    ],
    growth: [
      { recipientType: 'MOTHER', date: '2026-04-01', weightKg: 56.0, context: 'First antenatal registration visit' },
      { recipientType: 'MOTHER', date: '2026-08-14', weightKg: 62.5, context: '22-week antenatal review' },
    ],
    milestones: [],
    medications: [],
    careRecommendations: [
      { type: 'GENERAL', title: 'Second-trimester care guidance', description: 'Continue prenatal vitamins, increase iron and calcium intake, and schedule the next antenatal visit at 26 weeks.', date: '2026-08-14' },
    ],
    consultationNotes: [
      { date: '2026-08-14', title: '22-week antenatal review', note: 'Fetal growth on track, no concerns noted. Continue current supplementation.' },
    ],
    documents: [
      { name: 'Anomaly Scan - 20 Weeks', category: 'ULTRASOUND', date: '2026-07-10', status: 'COMPLETED', description: 'Detailed fetal anomaly screening, no abnormalities detected.', fileSize: '7.2 MB', fileType: 'PDF' },
    ],
  },
  {
    email: 'priyanka.shah@example.com',
    name: 'Priyanka Shah',
    phone: '+91 98200 11224',
    age: 34,
    bloodGroup: 'A-',
    location: 'Bandra, Mumbai',
    motherStage: 'pregnancy',
    pregnancyWeek: 30,
    emergencyContact: { name: 'Vikram Shah', relation: 'Spouse', phone: '+91 98200 11225' },
    care: {
      stage: 'ANTENATAL',
      status: 'FOLLOW_UP_DUE',
      riskLevel: 'MODERATE',
      pregnancyWeek: 30,
      expectedDeliveryDate: '2026-10-15',
      gravida: 'G2P0',
      ancVisitsCompleted: 6,
      ancVisitsPlanned: 8,
      highRiskFactors: ['Advanced maternal age', 'Previous pregnancy loss'],
      lastVisitDate: '2026-08-19',
      registeredOn: '2026-03-05',
    },
    appointments: [
      { category: 'ANTENATAL_CHECKUP', title: '30-Week High-Risk Antenatal Review', date: '2026-08-29', time: '09:30 AM', location: 'OPD Block A, Room 101', reason: 'Weekly monitoring given maternal age and prior pregnancy loss.', status: 'upcoming', forChild: false },
      { category: 'ULTRASOUND_SCAN', title: 'Growth Scan Ultrasound - 28 Weeks', date: '2026-08-01', time: '09:30 AM', location: 'Radiology Suite', status: 'completed', forChild: false },
    ],
    vaccinations: [
      { code: 'TT1', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 1 of 2', doseLabel: 'Dose 1 of 2', recommendedDate: '2026-03-05', givenDate: '2026-03-05', status: 'completed', location: 'OPD Block A, Room 101', forChild: false },
      { code: 'TT2', vaccineName: 'Tetanus Toxoid (TT)', targetAgeDescription: 'Dose 2 of 2', doseLabel: 'Dose 2 of 2', recommendedDate: '2026-04-02', givenDate: '2026-04-02', status: 'completed', location: 'OPD Block A, Room 101', forChild: false },
    ],
    growth: [
      { recipientType: 'MOTHER', date: '2026-03-05', weightKg: 62.0, context: 'First antenatal registration visit' },
      { recipientType: 'MOTHER', date: '2026-08-19', weightKg: 71.0, context: '30-week high-risk review' },
    ],
    milestones: [],
    medications: [
      { name: 'Low-Dose Aspirin', dosage: '75 mg', frequency: 'Once daily', startDate: '2026-07-01', status: 'active', instructions: 'Pre-eclampsia prophylaxis given advanced maternal age.', forChild: false },
    ],
    careRecommendations: [
      { type: 'LIFESTYLE', title: 'High-risk pregnancy monitoring plan', description: 'Weekly blood pressure checks, low-dose aspirin continued, and close fetal growth monitoring given maternal age and prior pregnancy loss.', date: '2026-08-19' },
    ],
    consultationNotes: [
      { date: '2026-08-19', title: '30-week high-risk review', note: 'Blood pressure stable, fetal growth appropriate for gestational age. Continue weekly monitoring given risk profile.' },
    ],
    documents: [
      { name: 'Growth Scan Ultrasound - 28 Weeks', category: 'ULTRASOUND', date: '2026-08-01', status: 'COMPLETED', description: 'Fetal growth appropriate for gestational age, placenta and fluid normal.', fileSize: '7.9 MB', fileType: 'PDF' },
    ],
  },
  {
    email: 'neha.deshmukh@example.com',
    name: 'Neha Deshmukh',
    phone: '+91 99870 22334',
    age: 27,
    bloodGroup: 'B+',
    location: 'Powai, Mumbai',
    motherStage: 'postpartum',
    deliveryDate: '2026-07-05',
    emergencyContact: { name: 'Rohan Deshmukh', relation: 'Spouse', phone: '+91 99870 22335' },
    child: { name: 'Aisha Deshmukh', gender: 'girl', dateOfBirth: '2026-07-05', birthWeightKg: 3.1, currentWeightKg: 4.3, bloodGroup: 'B+' },
    care: {
      stage: 'POSTNATAL',
      status: 'STABLE',
      riskLevel: 'LOW',
      deliveryDate: '2026-07-05',
      deliveryType: 'Normal',
      postpartumWeeks: 7,
      recoveryStatus: 'Recovering well, no complications.',
      breastfeedingStatus: 'Exclusive breastfeeding, well established.',
      lastVisitDate: '2026-08-20',
      registeredOn: '2025-12-10',
    },
    appointments: [
      { category: 'POSTNATAL_CHECKUP', title: '6-Week Postpartum & Pediatric Checkup', date: '2026-08-16', time: '10:00 AM', location: 'OPD Block A, Room 101', status: 'completed', forChild: false },
      { category: 'VACCINATION', title: 'Pentavalent-2, OPV-2, Rotavirus-2', date: '2026-09-13', time: '10:30 AM', location: 'Pediatric Wing', reason: '10-week routine immunization for Aisha.', status: 'upcoming', forChild: true },
    ],
    vaccinations: [
      { code: 'BCG_OPV0_HEPB1', vaccineName: 'BCG, OPV-0, Hepatitis B-1', targetAgeDescription: 'Birth Dose', doseLabel: 'Birth Dose', recommendedDate: '2026-07-05', givenDate: '2026-07-06', status: 'completed', location: 'Pediatric Wing', administeredBy: 'Andheri Care Hospital Team', forChild: true },
      { code: 'PENTA1_OPV1_ROTA1_PCV1', vaccineName: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1', targetAgeDescription: '6 Weeks', doseLabel: '6 Weeks', recommendedDate: '2026-08-16', givenDate: '2026-08-16', status: 'completed', location: 'Pediatric Wing', forChild: true },
      { code: 'PENTA2_OPV2_ROTA2', vaccineName: 'Pentavalent-2, OPV-2, Rotavirus-2', targetAgeDescription: '10 Weeks', doseLabel: '10 Weeks', recommendedDate: '2026-09-13', status: 'upcoming', location: 'Pediatric Wing', reminderEnabled: true, forChild: true },
    ],
    growth: [
      { recipientType: 'CHILD', date: '2026-07-05', weightKg: 3.1, heightCm: 49, headCircumferenceCm: 34, context: 'Birth measurements' },
      { recipientType: 'CHILD', date: '2026-08-16', weightKg: 4.3, heightCm: 54, headCircumferenceCm: 36, context: '6-week postpartum & pediatric checkup' },
    ],
    milestones: [
      { recipientType: 'CHILD', category: 'MOTOR', title: 'Lifts head briefly during tummy time', description: 'Aisha can briefly lift and hold her head up while lying on her tummy.', targetAgeRange: 'By 4-6 Weeks', status: 'achieved', achievedDate: '2026-08-10' },
      { recipientType: 'CHILD', category: 'SOCIAL', title: 'Begins to smile responsively', description: 'Starting to smile in response to voice or face, not just reflexively.', targetAgeRange: '6-8 Weeks', status: 'due_soon' },
    ],
    medications: [],
    careRecommendations: [
      { type: 'NUTRITION', title: 'Postpartum nutrition plan', description: 'Continue balanced protein-rich meals and fluid intake to support breastfeeding and recovery.', date: '2026-08-16' },
    ],
    consultationNotes: [
      { date: '2026-08-16', title: '6-week postpartum & pediatric review', note: 'Mother recovering well. Baby feeding and gaining weight appropriately, on track for age.' },
    ],
    documents: [
      { name: 'Hospital Discharge Summary (Delivery)', category: 'OTHER', date: '2026-07-05', status: 'COMPLETED', description: 'Postpartum discharge summary following normal delivery of baby girl.', fileSize: '1.4 MB', fileType: 'PDF' },
    ],
  },
  {
    email: 'sana.khan@example.com',
    name: 'Sana Khan',
    phone: '+91 98920 44556',
    age: 29,
    bloodGroup: 'O+',
    location: 'Andheri East, Mumbai',
    motherStage: 'postpartum',
    deliveryDate: '2026-08-10',
    emergencyContact: { name: 'Imran Khan', relation: 'Spouse', phone: '+91 98920 44557' },
    child: { name: 'Zara Khan', gender: 'girl', dateOfBirth: '2026-08-10', birthWeightKg: 2.8, currentWeightKg: 3.0, bloodGroup: 'O+' },
    care: {
      stage: 'POSTNATAL',
      status: 'FOLLOW_UP_DUE',
      riskLevel: 'MODERATE',
      deliveryDate: '2026-08-10',
      deliveryType: 'C-Section',
      postpartumWeeks: 2,
      recoveryStatus: 'Surgical site healing, mild pain managed with medication.',
      breastfeedingStatus: 'Mixed feeding, lactation support ongoing.',
      lastVisitDate: '2026-08-24',
      registeredOn: '2026-01-20',
    },
    appointments: [
      { category: 'POSTNATAL_CHECKUP', title: 'Postnatal Wound Check', date: '2026-08-31', time: '10:00 AM', location: 'OPD Block A, Room 101', status: 'upcoming', forChild: false },
      { category: 'PEDIATRIC_CHECKUP', title: 'Newborn Neonatal Check', date: '2026-08-17', time: '11:00 AM', location: 'Pediatric Wing', status: 'completed', forChild: true },
    ],
    vaccinations: [
      { code: 'BCG_OPV0_HEPB1', vaccineName: 'BCG, OPV-0, Hepatitis B-1', targetAgeDescription: 'Birth Dose', doseLabel: 'Birth Dose', recommendedDate: '2026-08-10', givenDate: '2026-08-11', status: 'completed', location: 'Pediatric Wing', administeredBy: 'Andheri Care Hospital Team', forChild: true },
    ],
    growth: [
      { recipientType: 'CHILD', date: '2026-08-10', weightKg: 2.8, heightCm: 46, headCircumferenceCm: 32.5, context: 'Birth measurements' },
      { recipientType: 'CHILD', date: '2026-08-17', weightKg: 3.0, heightCm: 46.5, headCircumferenceCm: 33, context: 'Newborn neonatal check' },
    ],
    milestones: [],
    medications: [
      { name: 'Paracetamol + Ibuprofen', dosage: '500 mg / 400 mg', frequency: 'Twice daily as needed', startDate: '2026-08-10', status: 'active', instructions: 'For post-operative pain management.', forChild: false },
    ],
    careRecommendations: [
      { type: 'MEDICATION', title: 'Post-operative recovery & lactation support', description: 'Continue pain management as needed, keep surgical site clean and dry, and continue lactation support for mixed feeding.', date: '2026-08-17' },
    ],
    consultationNotes: [
      { date: '2026-08-17', title: '2-week postpartum review', note: 'Surgical wound healing well. Lactation support continuing, baby feeding adequately.' },
    ],
    documents: [
      { name: 'C-Section Discharge Summary', category: 'OTHER', date: '2026-08-10', status: 'COMPLETED', description: 'Post-operative discharge summary following C-section delivery.', fileSize: '1.5 MB', fileType: 'PDF' },
    ],
  },
];

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
    const pcrId = await ensureCareAssignment(motherId, doctorId, hospitalId, childId);

    console.log('Seeding appointments');
    await ensureAppointments(motherId, doctorId, hospitalId, childId, APPOINTMENT_SEEDS);

    console.log('Seeding vaccinations');
    await ensureVaccinations(motherId, doctorId, hospitalId, childId, VACCINATION_SEEDS);

    console.log('Seeding growth measurements');
    await ensureGrowthMeasurements(motherId, doctorId, hospitalId, childId, GROWTH_SEEDS);

    console.log('Seeding milestones');
    await ensureMilestones(motherId, childId, MILESTONE_SEEDS);

    console.log('Seeding daily goals');
    await ensureDailyGoals(motherId, DAILY_GOAL_SEEDS);

    console.log('Seeding nutrition reminders');
    await ensureNutritionReminders(motherId, NUTRITION_REMINDER_SEEDS);

    console.log('Seeding care recommendations (care plan)');
    await ensureCareRecommendations(pcrId, doctorId, [
      {
        type: 'NUTRITION',
        title: 'Postpartum nutrition & hydration plan',
        description: 'Increase protein and fluid intake to support recovery and breastfeeding. Continue iron and calcium supplementation.',
        date: '2026-08-01',
      },
    ]);

    console.log('Seeding consultation notes');
    await ensureConsultationNotes(pcrId, doctorId, [
      {
        date: '2026-08-01',
        title: '2-week postpartum review',
        note: 'Mother recovering well, no signs of infection. Baby feeding and gaining weight appropriately.',
      },
    ]);

    console.log('Seeding medications');
    await ensureMedications(motherId, doctorId, hospitalId, childId, [
      { name: 'Iron & Folic Acid + Calcium', dosage: '1 tablet each', frequency: 'Once daily', startDate: '2026-07-19', status: 'active', instructions: 'Continue through the postpartum recovery period.', forChild: false },
    ]);

    console.log('Seeding documents (reports)');
    await ensureDocuments(motherId, pcrId, doctorId, hospitalId, DOCUMENT_SEEDS);

    console.log('\nSeeding Dr. Priya Menon’s additional patients');
    for (const scenario of PRIYA_ADDITIONAL_MOTHERS) {
      await seedMother(hospitalId, doctorId, scenario);
    }

    console.log('\nSeeding second hospital: Andheri Care Women & Children Hospital');
    const secondHospitalId = await ensureUser('care@andhericarehospital.org', 'Andheri Care Women & Children Hospital', 'hospital', undefined, {
      facilityName: 'Andheri Care Women & Children Hospital',
      facilityType: 'Private Maternity Center',
      licenseNumber: 'MH-MED-2023-5521',
      address: 'Link Road, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400058',
      contactNumber: '+91 22 4040 7000',
      totalBeds: 80,
      neonatalIcuAvailable: true,
      status: 'ACTIVE',
    });

    console.log('Seeding second doctor: Dr. Arjun Nair');
    const secondDoctorId = await ensureUser('arjun.nair@andhericarehospital.org', 'Dr. Arjun Nair', 'doctor', undefined, {
      specialization: 'Consultant Gynecologist & Obstetrician',
      qualification: 'MBBS, DGO',
      hospitalId: secondHospitalId,
      experienceYears: 10,
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      location: 'Andheri West, Mumbai',
    });

    console.log('\nSeeding Dr. Arjun Nair’s patients');
    for (const scenario of DOCTOR2_MOTHERS) {
      await seedMother(secondHospitalId, secondDoctorId, scenario);
    }

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

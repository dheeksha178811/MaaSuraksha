import { pool } from '../config/db';
import {
  AppointmentInput,
  BpReadingInput,
  PatientInput,
  RULE_DEFINITIONS,
  RiskFlag,
  WarningSignInput,
  evaluateFlags,
  isOverdueAppointment,
  isUpcomingAppointment,
  weeklyEventCounts,
  windowStartFor,
} from './maternalRiskRules';

// Every query here is scoped by patient_care_records.doctor_id = <JWT user id>
// AND is_active, the same ownership check doctorService.ts uses. A patient
// assigned to another doctor simply never appears; for single-patient calls
// that surfaces as `null` (the controller maps it to 404).

interface RosterRow {
  patient_id: string;
  mother_id: string;
  name: string;
  risk_level: string | null;
  high_risk_factors: string[] | null;
}

async function loadRoster(doctorId: string): Promise<RosterRow[]> {
  const r = await pool.query<RosterRow>(
    `SELECT pcr.id AS patient_id, pcr.mother_id, u.name, pcr.risk_level, pcr.high_risk_factors
     FROM patient_care_records pcr
     JOIN users u ON u.id = pcr.mother_id
     WHERE pcr.doctor_id = $1 AND pcr.is_active = true
     ORDER BY u.name ASC`,
    [doctorId]
  );
  return r.rows;
}

async function loadToday(): Promise<string> {
  const r = await pool.query<{ today: string }>('SELECT CURRENT_DATE AS today');
  return r.rows[0].today;
}

export interface ReviewInfo {
  decision: 'CONFIRMED' | 'DISMISSED';
  note: string | null;
  reviewedAt: string;
}

export interface FlagView extends RiskFlag {
  review: ReviewInfo | null;
}

export interface MaternalRiskAnalytics {
  generatedAt: string;
  today: string;
  weeks: number;
  windowStart: string;
  summary: {
    patientsMonitored: number;
    patientsFlagged: number;
    overdueFollowUps: number;
    completedFollowUps: number;
  };
  weeklyFlags: ReturnType<typeof weeklyEventCounts>;
  followUpStatus: { completed: number; upcoming: number; overdue: number };
  patients: { patientId: string; name: string }[];
  flags: FlagView[];
  rules: typeof RULE_DEFINITIONS;
}

export async function getMaternalRiskAnalytics(doctorId: string, weeks: number): Promise<MaternalRiskAnalytics> {
  const [roster, today] = await Promise.all([loadRoster(doctorId), loadToday()]);
  const windowStart = windowStartFor(today, weeks);
  const patientIds = roster.map((p) => p.patient_id);
  const motherIds = roster.map((p) => p.mother_id);

  const [vitals, signs, appts, reviews] = patientIds.length
    ? await Promise.all([
        pool.query<{ id: string; pid: string; date: string; sys: number; dia: number }>(
          `SELECT id, patient_care_record_id AS pid, recorded_at::date AS date,
                  systolic_mmhg AS sys, diastolic_mmhg AS dia
           FROM maternal_vitals WHERE patient_care_record_id = ANY($1::uuid[])
           ORDER BY recorded_at DESC`,
          [patientIds]
        ),
        pool.query<{ id: string; pid: string; code: string; date: string; notes: string | null }>(
          `SELECT id, patient_care_record_id AS pid, sign_code AS code, noted_on AS date, notes
           FROM maternal_warning_signs WHERE patient_care_record_id = ANY($1::uuid[])
           ORDER BY noted_on DESC, created_at DESC`,
          [patientIds]
        ),
        pool.query<{ id: string; mother_id: string; date: string; status: string | null; title: string | null }>(
          `SELECT id, mother_id, appt_date AS date, status, title
           FROM appointments
           WHERE doctor_id = $1 AND mother_id = ANY($2::uuid[]) AND appt_date IS NOT NULL`,
          [doctorId, motherIds]
        ),
        pool.query<{ pid: string; flag_key: string; decision: 'CONFIRMED' | 'DISMISSED'; note: string | null; reviewed_at: string }>(
          `SELECT patient_care_record_id AS pid, flag_key, decision, note, reviewed_at
           FROM risk_flag_reviews WHERE patient_care_record_id = ANY($1::uuid[])`,
          [patientIds]
        ),
      ])
    : [{ rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }];

  const inputs: PatientInput[] = roster.map((p) => ({
    patientId: p.patient_id,
    name: p.name,
    riskLevel: p.risk_level,
    highRiskFactors: p.high_risk_factors ?? [],
    readings: vitals.rows
      .filter((v) => v.pid === p.patient_id)
      .map<BpReadingInput>((v) => ({ id: v.id, date: v.date, systolic: v.sys, diastolic: v.dia })),
    signs: signs.rows
      .filter((s) => s.pid === p.patient_id)
      .map<WarningSignInput>((s) => ({ id: s.id, code: s.code, date: s.date, notes: s.notes })),
    appointments: appts.rows
      .filter((a) => a.mother_id === p.mother_id)
      .map<AppointmentInput>((a) => ({ id: a.id, date: a.date, status: a.status, title: a.title })),
  }));

  const reviewMap = new Map(reviews.rows.map((r) => [`${r.pid}|${r.flag_key}`, r]));
  const flags: FlagView[] = evaluateFlags(inputs, windowStart, today).map((f) => {
    const r = reviewMap.get(`${f.patientId}|${f.flagKey}`);
    return { ...f, review: r ? { decision: r.decision, note: r.note, reviewedAt: r.reviewed_at } : null };
  });

  const allAppts = inputs.flatMap((p) => p.appointments);
  const overdue = allAppts.filter((a) => isOverdueAppointment(a, today)).length;
  const upcoming = allAppts.filter((a) => isUpcomingAppointment(a, today)).length;
  const completed = allAppts.filter(
    (a) => a.status === 'completed' && a.date >= windowStart && a.date <= today
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    today,
    weeks,
    windowStart,
    summary: {
      patientsMonitored: roster.length,
      patientsFlagged: new Set(flags.filter((f) => !f.review).map((f) => f.patientId)).size,
      overdueFollowUps: overdue,
      completedFollowUps: completed,
    },
    weeklyFlags: weeklyEventCounts(inputs, weeks, today),
    followUpStatus: { completed, upcoming, overdue },
    patients: roster.map((p) => ({ patientId: p.patient_id, name: p.name })),
    flags,
    rules: RULE_DEFINITIONS,
  };
}

// --- single-patient reads / writes ------------------------------------------

async function ownsPatient(doctorId: string, patientId: string): Promise<{ mother_id: string } | null> {
  const r = await pool.query<{ mother_id: string }>(
    `SELECT mother_id FROM patient_care_records WHERE id = $1 AND doctor_id = $2 AND is_active = true`,
    [patientId, doctorId]
  );
  return r.rows[0] ?? null;
}

export interface PatientTrends {
  patientId: string;
  bloodPressure: { id: string; date: string; systolic: number; diastolic: number }[];
  weight: { id: string; date: string; weightKg: number }[];
}

export async function getPatientTrends(doctorId: string, patientId: string): Promise<PatientTrends | null> {
  const owned = await ownsPatient(doctorId, patientId);
  if (!owned) return null;

  const [bp, weight] = await Promise.all([
    pool.query<{ id: string; date: string; sys: number; dia: number }>(
      `SELECT * FROM (
         SELECT id, recorded_at::date AS date, recorded_at, systolic_mmhg AS sys, diastolic_mmhg AS dia
         FROM maternal_vitals WHERE patient_care_record_id = $1
         ORDER BY recorded_at DESC LIMIT 60
       ) t ORDER BY recorded_at ASC`,
      [patientId]
    ),
    pool.query<{ id: string; date: string; kg: string }>(
      `SELECT * FROM (
         SELECT id, measured_on AS date, weight_kg AS kg
         FROM growth_measurements
         WHERE mother_id = $1 AND recipient_type = 'MOTHER' AND weight_kg IS NOT NULL AND measured_on IS NOT NULL
         ORDER BY measured_on DESC LIMIT 60
       ) t ORDER BY date ASC`,
      [owned.mother_id]
    ),
  ]);

  return {
    patientId,
    bloodPressure: bp.rows.map((r) => ({ id: r.id, date: r.date, systolic: r.sys, diastolic: r.dia })),
    weight: weight.rows.map((r) => ({ id: r.id, date: r.date, weightKg: Number(r.kg) })),
  };
}

export async function recordVital(
  doctorId: string,
  patientId: string,
  input: { systolic: number; diastolic: number; notes: string | null }
): Promise<{ id: string } | null> {
  const owned = await ownsPatient(doctorId, patientId);
  if (!owned) return null;
  const r = await pool.query<{ id: string }>(
    `INSERT INTO maternal_vitals
       (patient_care_record_id, mother_id, recorded_by_doctor_id, systolic_mmhg, diastolic_mmhg, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [patientId, owned.mother_id, doctorId, input.systolic, input.diastolic, input.notes]
  );
  return r.rows[0];
}

export async function recordWarningSign(
  doctorId: string,
  patientId: string,
  input: { signCode: string; notes: string | null }
): Promise<{ id: string } | null> {
  const owned = await ownsPatient(doctorId, patientId);
  if (!owned) return null;
  const r = await pool.query<{ id: string }>(
    `INSERT INTO maternal_warning_signs
       (patient_care_record_id, mother_id, recorded_by_doctor_id, sign_code, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [patientId, owned.mother_id, doctorId, input.signCode, input.notes]
  );
  return r.rows[0];
}

/**
 * Stores/updates the clinician's decision on one flag. The flag key must be
 * one the engine currently produces for this patient — a client cannot attach
 * a review to an arbitrary string.
 */
export async function reviewFlag(
  doctorId: string,
  patientId: string,
  input: { flagKey: string; decision: 'CONFIRMED' | 'DISMISSED'; note: string | null }
): Promise<'ok' | 'patient_not_found' | 'flag_not_found'> {
  if (!(await ownsPatient(doctorId, patientId))) return 'patient_not_found';

  const analytics = await getMaternalRiskAnalytics(doctorId, 52);
  if (!analytics.flags.some((f) => f.patientId === patientId && f.flagKey === input.flagKey)) {
    return 'flag_not_found';
  }
  await pool.query(
    `INSERT INTO risk_flag_reviews (patient_care_record_id, reviewed_by_doctor_id, flag_key, decision, note)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (patient_care_record_id, flag_key)
     DO UPDATE SET decision = EXCLUDED.decision, note = EXCLUDED.note,
                   reviewed_by_doctor_id = EXCLUDED.reviewed_by_doctor_id, reviewed_at = now()`,
    [patientId, doctorId, input.flagKey, input.decision, input.note]
  );
  return 'ok';
}

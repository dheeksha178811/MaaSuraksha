import { pool } from '../config/db';
import { AuthError } from './authService';

export interface AppointmentRow {
  id: string;
  mother_id: string;
  child_id: string | null;
  doctor_id: string;
  hospital_id: string;
  category: string | null;
  title: string | null;
  appt_date: string | null;
  appt_time: string | null;
  location: string | null;
  reason: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestAppointmentInput {
  category: string;
  reason: string;
  apptDate: string;
  apptTime: string;
}

const COLUMNS = `id, mother_id, child_id, doctor_id, hospital_id, category, title, appt_date,
  appt_time, location, reason, status, notes, created_at, updated_at`;

/**
 * Ported verbatim from motherAppointmentsMockData.ts's APPOINTMENT_CATEGORY_LABELS
 * — createRequestedAppointment() sets title to exactly this label for the
 * chosen category, not something invented here.
 */
const CATEGORY_LABELS: Record<string, string> = {
  ANTENATAL_CHECKUP: 'Antenatal Check-up',
  ULTRASOUND_SCAN: 'Ultrasound / Scan',
  LAB_TEST: 'Lab / Test',
  POSTNATAL_CHECKUP: 'Postnatal Check-up',
  PEDIATRIC_CHECKUP: 'Child / Pediatric Check-up',
  VACCINATION: 'Vaccination',
};

/**
 * appointments.mother_id has a FK to mother_profiles(id), so an orphan user
 * (JWT role=mother but no mother_profiles row — see Part 1) can never
 * legitimately own an appointment row. Same 404 convention used throughout
 * Phase 4/5.
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

export async function listMyAppointments(motherId: string): Promise<AppointmentRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<AppointmentRow>(
    `SELECT ${COLUMNS}
     FROM appointments
     WHERE mother_id = $1
     ORDER BY appt_date ASC, appt_time ASC`,
    [motherId]
  );
  return result.rows;
}

/**
 * RequestAppointmentModal.tsx never lets the mother pick a doctor or
 * hospital — its own copy says "With {doctor} at {hospital}... sent to
 * {hospital} for confirmation" — so doctor_id/hospital_id are derived here
 * from the mother's active patient_care_records assignment
 * (UNIQUE(mother_id) WHERE is_active — at most one), never accepted from
 * the client. If she has no active assignment yet, an appointment cannot be
 * requested — that is a real missing-related-record case, not an invented
 * restriction, since the modal's premise ("With Dr. X at Hospital Y")
 * doesn't exist without one. status is always 'requested' (never accepted
 * from the client), and location/title are derived the same way the mock's
 * own createRequestedAppointment() derives them (hospital name / category
 * label) rather than invented.
 */
export async function requestMyAppointment(motherId: string, input: RequestAppointmentInput): Promise<AppointmentRow> {
  const care = await pool.query<{ doctor_id: string; hospital_id: string }>(
    `SELECT doctor_id, hospital_id FROM patient_care_records WHERE mother_id = $1 AND is_active = true`,
    [motherId]
  );
  const assignment = care.rows[0];
  if (!assignment) {
    throw new AuthError(
      'No active care assignment found for this account. An appointment cannot be requested until a doctor and hospital are assigned.',
      404
    );
  }

  const hospital = await pool.query<{ facility_name: string }>(
    `SELECT facility_name FROM hospital_profiles WHERE id = $1`,
    [assignment.hospital_id]
  );
  const location = hospital.rows[0]?.facility_name ?? null;
  const title = CATEGORY_LABELS[input.category] ?? null;

  const result = await pool.query<AppointmentRow>(
    `INSERT INTO appointments (mother_id, doctor_id, hospital_id, category, title, appt_date, appt_time, location, reason, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'requested')
     RETURNING ${COLUMNS}`,
    [motherId, assignment.doctor_id, assignment.hospital_id, input.category, title, input.apptDate, input.apptTime, location, input.reason]
  );
  return result.rows[0];
}

/**
 * Ported verbatim from motherAppointmentsMockData.ts's isCancellable() and
 * isReschedulable() — both are defined with the exact same status set, and
 * MotherAppointmentsPage.tsx gates both the Cancel and Reschedule buttons
 * on it (`onCancel={isCancellable(status) ? ... : undefined}`, same for
 * reschedule). Not invented here.
 */
const CANCELLABLE_STATUSES = ['upcoming', 'requested', 'rescheduled'];

async function getOwnedAppointment(motherId: string, appointmentId: string): Promise<AppointmentRow> {
  const result = await pool.query<AppointmentRow>(
    `SELECT ${COLUMNS} FROM appointments WHERE id = $1 AND mother_id = $2`,
    [appointmentId, motherId]
  );
  const appointment = result.rows[0];
  if (!appointment) {
    throw new AuthError('Appointment not found for this account.', 404);
  }
  return appointment;
}

/**
 * Mirrors MotherAppointmentsPage.tsx's handleConfirmCancel exactly: only
 * `status` changes to 'cancelled', nothing else.
 */
export async function cancelMyAppointment(motherId: string, appointmentId: string): Promise<AppointmentRow> {
  const appointment = await getOwnedAppointment(motherId, appointmentId);

  if (!CANCELLABLE_STATUSES.includes(appointment.status ?? '')) {
    throw new AuthError(`An appointment with status "${appointment.status}" cannot be cancelled.`, 409);
  }

  const result = await pool.query<AppointmentRow>(
    `UPDATE appointments
     SET status = 'cancelled', updated_at = now()
     WHERE id = $1 AND mother_id = $2
     RETURNING ${COLUMNS}`,
    [appointmentId, motherId]
  );
  return result.rows[0];
}

/**
 * Mirrors MotherAppointmentsPage.tsx's handleConfirmReschedule exactly:
 * date, time, and status change to 'rescheduled' — everything else
 * (doctor, hospital, category, title, reason) is left untouched, matching
 * the mock's `{ ...a, date: newDate, time: newTime, status: 'rescheduled' }`.
 */
export async function rescheduleMyAppointment(
  motherId: string,
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<AppointmentRow> {
  const appointment = await getOwnedAppointment(motherId, appointmentId);

  if (!CANCELLABLE_STATUSES.includes(appointment.status ?? '')) {
    throw new AuthError(`An appointment with status "${appointment.status}" cannot be rescheduled.`, 409);
  }

  const result = await pool.query<AppointmentRow>(
    `UPDATE appointments
     SET appt_date = $3, appt_time = $4, status = 'rescheduled', updated_at = now()
     WHERE id = $1 AND mother_id = $2
     RETURNING ${COLUMNS}`,
    [appointmentId, motherId, newDate, newTime]
  );
  return result.rows[0];
}

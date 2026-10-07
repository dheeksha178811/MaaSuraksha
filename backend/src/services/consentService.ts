import { pool } from '../config/db';
import { AuthError } from './authService';
import { listDocumentsForMother } from './documentService';
import { listMyAppointments } from './appointmentService';
import { listMyVaccinations } from './vaccinationService';
import { listMyGrowthMeasurements } from './growthMeasurementService';
import { listMyMilestones } from './milestoneService';

// ---------------------------------------------------------------------------
// QR consent flow (migration 008). A doctor/hospital that has scanned a
// mother's QR may request extra sections of her record. Nothing is released
// until the mother approves, and then only the requested sections, only to the
// requester, and only until access_expires_at. Every protected read goes
// through getApprovedDataForRequester, which re-checks all of that in SQL.
// ---------------------------------------------------------------------------

export const CONSENT_SECTIONS = ['reports', 'appointments', 'medications', 'vaccinations', 'growth'] as const;
export type ConsentSection = (typeof CONSENT_SECTIONS)[number];

export type ConsentStatus = 'pending' | 'approved' | 'denied' | 'expired';
export type Requester = { id: string; role: 'doctor' | 'hospital' };

// Demo duration for a granted window; stored as an absolute timestamp.
export const ACCESS_DURATION_MINUTES = 30;

interface ConsentRow {
  id: string;
  mother_id: string;
  requester_type: 'doctor' | 'hospital';
  requester_id: string;
  requested_sections: ConsentSection[];
  status: ConsentStatus;
  requested_at: string;
  responded_at: string | null;
  access_expires_at: string | null;
  requester_name: string | null;
  access_granted: boolean;
  server_now: string;
}

export interface ConsentRequestView {
  id: string;
  requesterType: 'doctor' | 'hospital';
  requesterName: string | null;
  sections: ConsentSection[];
  status: ConsentStatus;
  requestedAt: string;
  respondedAt: string | null;
  accessExpiresAt: string | null;
  // Database clock at read time, so clients can count down without trusting
  // their own (possibly skewed) clock.
  serverNow: string;
}

// 'expired' is derived: an approved row whose window has passed. Computed in
// SQL with the database clock so it can never disagree with the access check.
// access_granted is the one authoritative "may this requester read data now"
// flag: approved, unexpired, and the requester still has an active care
// assignment to the mother (doctor_id / hospital_id depending on type).
const SELECT_VIEW = `
  SELECT cr.id, cr.mother_id, cr.requester_type, cr.requester_id, cr.requested_sections,
         CASE WHEN cr.status = 'approved' AND cr.access_expires_at <= now() THEN 'expired' ELSE cr.status END AS status,
         cr.requested_at, cr.responded_at, cr.access_expires_at,
         CASE cr.requester_type
           WHEN 'hospital' THEN (SELECT facility_name FROM hospital_profiles WHERE id = cr.requester_id)
           ELSE (SELECT name FROM users WHERE id = cr.requester_id)
         END AS requester_name,
         (cr.status = 'approved' AND cr.access_expires_at > now() AND EXISTS (
            SELECT 1 FROM patient_care_records pcr
             WHERE pcr.mother_id = cr.mother_id AND pcr.is_active = true
               AND CASE cr.requester_type WHEN 'doctor' THEN pcr.doctor_id ELSE pcr.hospital_id END = cr.requester_id
         )) AS access_granted,
         now() AS server_now
    FROM consent_requests cr`;

function toView(row: ConsentRow): ConsentRequestView {
  return {
    id: row.id,
    requesterType: row.requester_type,
    requesterName: row.requester_name,
    sections: row.requested_sections,
    status: row.status,
    requestedAt: row.requested_at,
    respondedAt: row.responded_at,
    // Only meaningful (and only disclosed) for an approved/expired grant.
    accessExpiresAt: row.status === 'approved' || row.status === 'expired' ? row.access_expires_at : null,
    serverNow: row.server_now,
  };
}

// ---------------------------------------------------------------------------
// Requester side
// ---------------------------------------------------------------------------

/**
 * Resolves a QR token to a mother_id under exactly the rule lookupByQrToken
 * (careCardService) applies: the token must belong to an active care card AND
 * the requester must hold an active patient_care_records assignment to that
 * mother. Anything else is the same indistinguishable 404 as a scan.
 */
async function resolveMotherForRequester(qrToken: string, requester: Requester): Promise<string> {
  const pcrColumn = requester.role === 'doctor' ? 'doctor_id' : 'hospital_id';
  const result = await pool.query<{ mother_id: string }>(
    `SELECT cc.mother_id
       FROM care_cards cc
       JOIN patient_care_records pcr ON pcr.mother_id = cc.mother_id AND pcr.is_active = true
      WHERE cc.qr_token = $1 AND cc.is_active = true AND pcr.${pcrColumn} = $2
      LIMIT 1`,
    [qrToken, requester.id]
  );
  if (!result.rows[0]) {
    throw new AuthError('QR code not recognised or you do not have access to this patient.', 404);
  }
  return result.rows[0].mother_id;
}

export function parseSections(input: unknown): ConsentSection[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new AuthError('Select at least one section to request.', 400);
  }
  const unique = Array.from(new Set(input));
  for (const s of unique) {
    if (typeof s !== 'string' || !(CONSENT_SECTIONS as readonly string[]).includes(s)) {
      throw new AuthError('One or more requested sections are not valid.', 400);
    }
  }
  return unique as ConsentSection[];
}

export async function createConsentRequest(
  requester: Requester,
  qrToken: string,
  sections: ConsentSection[]
): Promise<ConsentRequestView> {
  const motherId = await resolveMotherForRequester(qrToken, requester);

  try {
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO consent_requests (mother_id, requester_type, requester_id, requested_sections)
            VALUES ($1, $2, $3, $4)
         RETURNING id`,
      [motherId, requester.role, requester.id, sections]
    );
    return getRequestForRequester(requester, inserted.rows[0].id);
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new AuthError('You already have a pending request for this patient. Wait for her response.', 409);
    }
    throw error;
  }
}

/** Most recent request this requester made for the mother behind the token (or null). */
export async function getCurrentRequestForToken(requester: Requester, qrToken: string): Promise<ConsentRequestView | null> {
  const motherId = await resolveMotherForRequester(qrToken, requester);
  const result = await pool.query<ConsentRow>(
    `${SELECT_VIEW}
      WHERE cr.mother_id = $1 AND cr.requester_id = $2
      ORDER BY cr.requested_at DESC
      LIMIT 1`,
    [motherId, requester.id]
  );
  return result.rows[0] ? toView(result.rows[0]) : null;
}

/** A request is visible only to the account that made it; anyone else gets 404. */
export async function getRequestForRequester(requester: Requester, requestId: string): Promise<ConsentRequestView> {
  const result = await pool.query<ConsentRow>(
    `${SELECT_VIEW} WHERE cr.id = $1 AND cr.requester_id = $2 AND cr.requester_type = $3`,
    [requestId, requester.id, requester.role]
  );
  if (!result.rows[0]) {
    throw new AuthError('Access request not found.', 404);
  }
  return toView(result.rows[0]);
}

export interface ApprovedData {
  reports?: unknown[];
  appointments?: unknown[];
  medications?: unknown[];
  vaccinations?: unknown[];
  growth?: { measurements: unknown[]; milestones: unknown[] };
}

/**
 * The single gate for additional patient data. One query establishes that the
 * request belongs to this requester (id + role), is approved, has not expired
 * (database clock), and that the requester still holds an active care
 * assignment to the mother. Only then are the granted sections read — for the
 * mother_id stored on the request, never anything the client sent.
 *
 *  - not theirs / unknown id       -> 404
 *  - pending / denied / expired    -> 403 (no data)
 */
export async function getApprovedDataForRequester(
  requester: Requester,
  requestId: string
): Promise<{ request: ConsentRequestView; data: ApprovedData }> {
  const result = await pool.query<ConsentRow>(
    `${SELECT_VIEW} WHERE cr.id = $1 AND cr.requester_id = $2 AND cr.requester_type = $3`,
    [requestId, requester.id, requester.role]
  );
  const row = result.rows[0];
  if (!row) {
    throw new AuthError('Access request not found.', 404);
  }
  if (!row.access_granted) {
    const message =
      row.status === 'pending'
        ? 'This request has not been approved by the patient yet.'
        : row.status === 'denied'
          ? 'The patient denied this request.'
          : 'Temporary access is no longer available. Send a new request to view these details again.';
    throw new AuthError(message, 403);
  }

  const motherId = row.mother_id;
  const sections = row.requested_sections;
  const data: ApprovedData = {};

  if (sections.includes('reports')) {
    // file_url is internal storage metadata — never sent.
    const docs = await listDocumentsForMother(motherId);
    data.reports = docs.map((d) => ({
      id: d.id, name: d.name, category: d.category, date: d.doc_date, status: d.status,
      description: d.description, fileType: d.file_type, fileSize: d.file_size,
      doctorName: d.doctor_name, hospitalName: d.hospital_name,
    }));
  }
  if (sections.includes('appointments')) {
    const rows = await listMyAppointments(motherId);
    data.appointments = rows.map((a) => ({
      id: a.id, title: a.title, category: a.category, date: a.appt_date, time: a.appt_time,
      location: a.location, reason: a.reason, status: a.status, notes: a.notes,
      doctorName: a.doctor_name, hospitalName: a.hospital_name,
    }));
  }
  if (sections.includes('medications')) {
    // No medications service exists yet, so this is the one direct query here.
    const meds = await pool.query(
      `SELECT m.id, m.name, m.dosage, m.frequency, m.timing,
              m.start_date AS "startDate", m.end_date AS "endDate",
              m.status, m.instructions, m.caution,
              (SELECT name FROM users WHERE id = m.doctor_id) AS "doctorName"
         FROM medications m
        WHERE m.mother_id = $1
        ORDER BY m.start_date DESC NULLS LAST, m.created_at DESC`,
      [motherId]
    );
    data.medications = meds.rows;
  }
  if (sections.includes('vaccinations')) {
    const rows = await listMyVaccinations(motherId);
    data.vaccinations = rows.map((v) => ({
      id: v.id, vaccineName: v.vaccine_name, doseLabel: v.dose_label, recipientType: v.recipient_type,
      recommendedDate: v.recommended_date, givenDate: v.given_date, status: v.status,
      location: v.location, administeredBy: v.administered_by, notes: v.notes,
    }));
  }
  if (sections.includes('growth')) {
    const [measurements, milestones] = await Promise.all([listMyGrowthMeasurements(motherId), listMyMilestones(motherId)]);
    data.growth = {
      measurements: measurements.map((g) => ({
        id: g.id, recipientType: g.recipient_type, measuredOn: g.measured_on,
        weightKg: g.weight_kg, heightCm: g.height_cm, headCircumferenceCm: g.head_circumference_cm,
        context: g.context, notes: g.notes,
      })),
      milestones: milestones.map((m) => ({
        id: m.id, recipientType: m.recipient_type, category: m.category, title: m.title,
        description: m.description, targetAgeRange: m.target_age_range, status: m.status,
        achievedDate: m.achieved_date, notes: m.notes,
      })),
    };
  }

  return { request: toView(row), data };
}

// ---------------------------------------------------------------------------
// Mother side
// ---------------------------------------------------------------------------

export async function listRequestsForMother(motherId: string): Promise<ConsentRequestView[]> {
  const result = await pool.query<ConsentRow>(
    `${SELECT_VIEW} WHERE cr.mother_id = $1 ORDER BY cr.requested_at DESC`,
    [motherId]
  );
  return result.rows.map(toView);
}

/**
 * Atomic pending -> approved/denied. The WHERE clause carries the mother's own
 * id and status = 'pending', so only the mother the request is about can
 * decide it (a requester's JWT has the wrong role and never reaches this),
 * and a decision can't be replayed or flipped later.
 */
async function respond(motherId: string, requestId: string, approve: boolean): Promise<ConsentRequestView> {
  const result = approve
    ? await pool.query(
        `UPDATE consent_requests
            SET status = 'approved', responded_at = now(),
                access_expires_at = now() + make_interval(mins => $3)
          WHERE id = $1 AND mother_id = $2 AND status = 'pending'
      RETURNING id`,
        [requestId, motherId, ACCESS_DURATION_MINUTES]
      )
    : await pool.query(
        `UPDATE consent_requests
            SET status = 'denied', responded_at = now(), access_expires_at = NULL
          WHERE id = $1 AND mother_id = $2 AND status = 'pending'
      RETURNING id`,
        [requestId, motherId]
      );

  if (result.rowCount === 0) {
    const exists = await pool.query('SELECT 1 FROM consent_requests WHERE id = $1 AND mother_id = $2', [requestId, motherId]);
    if (exists.rowCount === 0) throw new AuthError('Access request not found.', 404);
    throw new AuthError('This request has already been answered.', 409);
  }

  const row = await pool.query<ConsentRow>(`${SELECT_VIEW} WHERE cr.id = $1 AND cr.mother_id = $2`, [requestId, motherId]);
  return toView(row.rows[0]);
}

export const approveConsentRequest = (motherId: string, requestId: string) => respond(motherId, requestId, true);
export const denyConsentRequest = (motherId: string, requestId: string) => respond(motherId, requestId, false);

import { pool } from '../config/db';
import { AuthError } from './authService';

// ---------------------------------------------------------------------------
// Referrals (hospital_referrals — migrations 003 + 009).
//
// Parties, all derived server-side:
//   sender    — the referring doctor, and the hospital the mother is under
//   receiver  — to_hospital_id
//   patient   — the mother (read-only)
// The client never supplies from_hospital_id / referring_doctor_id; they come
// from the patient's CURRENT active patient_care_records row, and the caller
// must be that row's doctor (doctor) or hospital (hospital).
//
// Every viewer — sender, receiver or patient — gets the same limited view:
// care-identity basics, the referral content and its status. Reports,
// medications, vaccinations, growth, appointments and document files are NOT
// reachable from here; they stay behind their own authorization / consent.
// ---------------------------------------------------------------------------

export type ReferralPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
export type Actor = { id: string; role: 'doctor' | 'hospital' | 'mother' };
type Clinician = { id: string; role: 'doctor' | 'hospital' };

export interface CreateReferralInput {
  mother_id: string;
  to_hospital_id: string;
  reason: string;
  priority: ReferralPriority;
  clinical_summary: string;
}

interface ReferralRow {
  id: string;
  mother_id: string;
  from_hospital_id: string;
  to_hospital_id: string;
  referring_doctor_id: string;
  mother_name: string;
  maa_suraksha_id: string | null;
  stage: string | null;
  blood_group: string | null;
  from_hospital_name: string;
  to_hospital_name: string;
  referring_doctor_name: string;
  reason: string | null;
  priority: ReferralPriority;
  clinical_summary: string;
  status: ReferralStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  in_transit_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export interface ReferralView {
  id: string;
  viewerRole: 'sender' | 'receiver' | 'patient';
  patient: { name: string; maaSurakshaId: string | null; stage: string | null; bloodGroup: string | null };
  fromHospital: string;
  toHospital: string;
  referringDoctor: string;
  reason: string | null;
  priority: ReferralPriority;
  clinicalSummary: string;
  status: ReferralStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  inTransitAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

// Internal ids stay inside the service; the view above is all that leaves it.
const SELECT_REFERRAL = `
  SELECT r.id, r.mother_id, r.from_hospital_id, r.to_hospital_id, r.referring_doctor_id,
         mu.name AS mother_name,
         (SELECT cc.maa_suraksha_id FROM care_cards cc WHERE cc.mother_id = r.mother_id AND cc.is_active = true
           ORDER BY cc.created_at DESC LIMIT 1) AS maa_suraksha_id,
         mp.stage, mp.blood_group,
         fh.facility_name AS from_hospital_name, th.facility_name AS to_hospital_name,
         du.name AS referring_doctor_name,
         r.reason, r.priority, r.clinical_summary, r.status, r.rejection_reason,
         r.created_at, r.updated_at, r.accepted_at, r.rejected_at, r.in_transit_at, r.completed_at, r.cancelled_at
    FROM hospital_referrals r
    JOIN users mu ON mu.id = r.mother_id
    JOIN mother_profiles mp ON mp.id = r.mother_id
    JOIN hospital_profiles fh ON fh.id = r.from_hospital_id
    JOIN hospital_profiles th ON th.id = r.to_hospital_id
    JOIN users du ON du.id = r.referring_doctor_id`;

// Which referrals an actor may see — the single visibility rule for list,
// detail and every transition. $1 is always the actor id.
//   doctor    — referrals they made
//   hospital  — referrals they sent or that were sent to them
//   mother    — her own
const VISIBLE_TO: Record<Actor['role'], string> = {
  doctor: 'r.referring_doctor_id = $1',
  hospital: '(r.from_hospital_id = $1 OR r.to_hospital_id = $1)',
  mother: 'r.mother_id = $1',
};

function viewerRoleOf(row: ReferralRow, actor: Actor): ReferralView['viewerRole'] {
  if (actor.role === 'mother') return 'patient';
  if (actor.role === 'hospital' && row.to_hospital_id === actor.id) return 'receiver';
  return 'sender';
}

function toView(row: ReferralRow, actor: Actor): ReferralView {
  return {
    id: row.id,
    viewerRole: viewerRoleOf(row, actor),
    patient: { name: row.mother_name, maaSurakshaId: row.maa_suraksha_id, stage: row.stage, bloodGroup: row.blood_group },
    fromHospital: row.from_hospital_name,
    toHospital: row.to_hospital_name,
    referringDoctor: row.referring_doctor_name,
    reason: row.reason,
    priority: row.priority,
    clinicalSummary: row.clinical_summary,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    rejectedAt: row.rejected_at,
    inTransitAt: row.in_transit_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
  };
}

async function loadVisible(actor: Actor, referralId: string): Promise<ReferralRow | null> {
  const result = await pool.query<ReferralRow>(`${SELECT_REFERRAL} WHERE r.id = $2 AND ${VISIBLE_TO[actor.role]}`, [actor.id, referralId]);
  return result.rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Destination picker
// ---------------------------------------------------------------------------

export interface HospitalOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

/** Active hospitals other than the caller's own. */
export async function listReferralDestinations(actor: Clinician): Promise<HospitalOption[]> {
  const result = await pool.query<HospitalOption>(
    `SELECT hp.id, hp.facility_name AS name, hp.city, hp.state
       FROM hospital_profiles hp
      WHERE hp.status = 'ACTIVE'
        AND hp.id <> COALESCE(
              CASE $2 WHEN 'hospital' THEN $1::uuid ELSE (SELECT hospital_id FROM doctor_profiles WHERE id = $1) END,
              '00000000-0000-0000-0000-000000000000'::uuid)
      ORDER BY hp.facility_name`,
    [actor.id, actor.role]
  );
  return result.rows;
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createReferral(actor: Clinician, input: CreateReferralInput): Promise<ReferralView> {
  // The caller must be this mother's CURRENT active assignee. Sender hospital
  // and referring doctor are read from that assignment, not from the client.
  // A hospital sender is recorded against the doctor on the same assignment,
  // because referring_doctor_id is NOT NULL.
  const assigneeColumn = actor.role === 'doctor' ? 'doctor_id' : 'hospital_id';
  const assignment = await pool.query<{ hospital_id: string; doctor_id: string }>(
    `SELECT hospital_id, doctor_id FROM patient_care_records
      WHERE mother_id = $1 AND ${assigneeColumn} = $2 AND is_active = true`,
    [input.mother_id, actor.id]
  );
  const care = assignment.rows[0];
  if (!care) {
    throw new AuthError('Patient not found for this account.', 404);
  }

  if (care.hospital_id === input.to_hospital_id) {
    throw new AuthError('A referral must be sent to a different hospital than the sender.', 400);
  }
  const destination = await pool.query(`SELECT 1 FROM hospital_profiles WHERE id = $1 AND status = 'ACTIVE'`, [input.to_hospital_id]);
  if (destination.rowCount === 0) {
    throw new AuthError('Destination hospital not found.', 404);
  }

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO hospital_referrals
       (mother_id, from_hospital_id, to_hospital_id, referring_doctor_id, reason, priority, clinical_summary, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
     RETURNING id`,
    [input.mother_id, care.hospital_id, input.to_hospital_id, care.doctor_id, input.reason, input.priority, input.clinical_summary]
  );

  const row = await loadVisible(actor, inserted.rows[0].id);
  return toView(row!, actor);
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function listReferrals(actor: Actor): Promise<ReferralView[]> {
  const result = await pool.query<ReferralRow>(
    `${SELECT_REFERRAL} WHERE ${VISIBLE_TO[actor.role]} ORDER BY r.created_at DESC`,
    [actor.id]
  );
  return result.rows.map((r) => toView(r, actor));
}

export async function getReferral(actor: Actor, referralId: string): Promise<ReferralView> {
  const row = await loadVisible(actor, referralId);
  if (!row) throw new AuthError('Referral not found.', 404);
  return toView(row, actor);
}

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

export type ReferralAction = 'accept' | 'reject' | 'in-transit' | 'complete' | 'cancel';
type Party = 'receiver' | 'sender' | 'either';

const TRANSITIONS: Record<ReferralAction, { from: ReferralStatus[]; to: ReferralStatus; by: Party; stamp: string }> = {
  accept: { from: ['PENDING'], to: 'ACCEPTED', by: 'receiver', stamp: 'accepted_at' },
  reject: { from: ['PENDING'], to: 'REJECTED', by: 'receiver', stamp: 'rejected_at' },
  'in-transit': { from: ['ACCEPTED'], to: 'IN_TRANSIT', by: 'either', stamp: 'in_transit_at' },
  complete: { from: ['IN_TRANSIT'], to: 'COMPLETED', by: 'receiver', stamp: 'completed_at' },
  cancel: { from: ['PENDING', 'ACCEPTED'], to: 'CANCELLED', by: 'sender', stamp: 'cancelled_at' },
};

// SQL for "the actor is this party", with the actor id as $1. Doctors and
// patients can never be the receiving hospital; patients are never a party.
function partyCondition(actor: Actor, party: Party): string | null {
  const receiver = actor.role === 'hospital' ? 'r.to_hospital_id = $1' : null;
  const sender = actor.role === 'hospital' ? 'r.from_hospital_id = $1' : actor.role === 'doctor' ? 'r.referring_doctor_id = $1' : null;
  if (party === 'receiver') return receiver;
  if (party === 'sender') return sender;
  const parts = [receiver, sender].filter(Boolean);
  return parts.length ? `(${parts.join(' OR ')})` : null;
}

/**
 * Order of checks: not visible to the caller -> 404 (nothing leaks); visible
 * but caller is the wrong party -> 403; right party but wrong current status
 * -> 409. The UPDATE itself repeats the party condition and the expected
 * previous status in its WHERE clause, so the transition is atomic and a lost
 * race or replay changes nothing.
 */
export async function transitionReferral(
  actor: Actor,
  referralId: string,
  action: ReferralAction,
  rejectionReason?: string
): Promise<ReferralView> {
  const t = TRANSITIONS[action];

  const visible = await loadVisible(actor, referralId);
  if (!visible) throw new AuthError('Referral not found.', 404);

  const party = partyCondition(actor, t.by);
  if (!party) throw new AuthError('You do not have permission to perform this action on this referral.', 403);

  const allowed = await pool.query(`SELECT 1 FROM hospital_referrals r WHERE r.id = $2 AND ${party}`, [actor.id, referralId]);
  if (allowed.rowCount === 0) {
    throw new AuthError('You do not have permission to perform this action on this referral.', 403);
  }

  const params: unknown[] = [actor.id, referralId, t.from, t.to];
  let reasonSet = '';
  if (action === 'reject') {
    params.push(rejectionReason);
    reasonSet = ', rejection_reason = $5';
  }
  const updated = await pool.query(
    `UPDATE hospital_referrals r
        SET status = $4, ${t.stamp} = now(), updated_at = now()${reasonSet}
      WHERE r.id = $2 AND r.status = ANY($3::text[]) AND ${party}
  RETURNING r.id`,
    params
  );
  if (updated.rowCount === 0) {
    throw new AuthError('This action is not available for the referral in its current status.', 409);
  }

  const row = await loadVisible(actor, referralId);
  return toView(row!, actor);
}

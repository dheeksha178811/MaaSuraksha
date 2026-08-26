import { pool } from '../config/db';
import { AuthError } from './authService';

// ---------------------------------------------------------------------------
// Mother <-> Doctor messaging (migration 003's conversations/messages
// tables). One conversation per (doctor_id, mother_id) pair — enforced by
// the table's own UNIQUE(doctor_id, mother_id) constraint — so "starting a
// conversation" is always find-or-create, never a second thread. messages.
// sender_role is constrained to ('doctor', 'patient'); the mother role is
// 'mother' everywhere else in this app (users.role), so toSenderRole is the
// one place that translation happens, always server-side from the verified
// JWT role — never from client input.
// ---------------------------------------------------------------------------

export type MessageParticipantRole = 'doctor' | 'mother';

function toSenderRole(role: MessageParticipantRole): 'doctor' | 'patient' {
  return role === 'mother' ? 'patient' : 'doctor';
}

export interface ConversationRow {
  conversation_id: string;
  doctor_id: string;
  mother_id: string;
  // patient_care_records id for this (mother, doctor) pair, resolved the
  // same way listMyAppointments resolves it — so the existing
  // AssignedPatient-keyed doctor UI (ConversationThread/PatientContextPanel)
  // keeps working unmodified. Only meaningful from the doctor's side; a
  // mother viewing her own conversations gets null here.
  patient_id: string | null;
  other_party_name: string;
  status: string;
  priority: string;
  unread_count: number;
  last_message_id: string | null;
  last_message_sender_role: string | null;
  last_message_body: string | null;
  last_message_sent_at: string | null;
}

export interface MessageRow {
  message_id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: string;
  sender_name: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

// unreadSenderRole/otherNameExpr/patientIdExpr below are built from `role`,
// a closed 'doctor' | 'mother' union derived from the verified JWT
// (never request input) — safe to inline as SQL literals.
function buildConversationColumns(role: MessageParticipantRole): string {
  const otherNameExpr =
    role === 'doctor' ? `(SELECT name FROM users WHERE id = c.mother_id)` : `(SELECT name FROM users WHERE id = c.doctor_id)`;
  const patientIdExpr =
    role === 'doctor'
      ? `(SELECT pcr.id FROM patient_care_records pcr WHERE pcr.mother_id = c.mother_id AND pcr.doctor_id = c.doctor_id AND pcr.is_active = true LIMIT 1)`
      : `NULL`;
  const unreadSenderRole = role === 'doctor' ? 'patient' : 'doctor';

  return `
    c.id AS conversation_id, c.doctor_id, c.mother_id,
    ${patientIdExpr} AS patient_id,
    ${otherNameExpr} AS other_party_name,
    c.status, c.priority,
    (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id AND m.sender_role = '${unreadSenderRole}' AND m.read_at IS NULL) AS unread_count,
    lm.id AS last_message_id, lm.sender_role AS last_message_sender_role, lm.body AS last_message_body, lm.sent_at AS last_message_sent_at
  `;
}

const LAST_MESSAGE_JOIN = `
  LEFT JOIN LATERAL (
    SELECT id, sender_role, body, sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1
  ) lm ON true
`;

export async function listConversationsForUser(userId: string, role: MessageParticipantRole): Promise<ConversationRow[]> {
  const ownColumn = role === 'doctor' ? 'c.doctor_id' : 'c.mother_id';
  const result = await pool.query<ConversationRow>(
    `SELECT ${buildConversationColumns(role)}
     FROM conversations c
     ${LAST_MESSAGE_JOIN}
     WHERE ${ownColumn} = $1
     ORDER BY COALESCE(lm.sent_at, c.created_at) DESC`,
    [userId]
  );
  return result.rows;
}

async function fetchConversationSummary(
  userId: string,
  role: MessageParticipantRole,
  conversationId: string
): Promise<ConversationRow | null> {
  const ownColumn = role === 'doctor' ? 'c.doctor_id' : 'c.mother_id';
  const result = await pool.query<ConversationRow>(
    `SELECT ${buildConversationColumns(role)}
     FROM conversations c
     ${LAST_MESSAGE_JOIN}
     WHERE c.id = $2 AND ${ownColumn} = $1`,
    [userId, conversationId]
  );
  return result.rows[0] ?? null;
}

/**
 * Rejects (returns null) unless userId is a genuine participant — doctor_id
 * or mother_id — on this conversation, the same ownership check every other
 * per-record doctor/mother endpoint in this app uses. Opening the thread
 * also marks the OTHER participant's messages as read, mirroring the mock's
 * markConversationRead-on-select behavior with a real, persisted read_at.
 */
export async function getConversationDetailForUser(
  userId: string,
  role: MessageParticipantRole,
  conversationId: string
): Promise<{ conversation: ConversationRow; messages: MessageRow[] } | null> {
  const ownColumn = role === 'doctor' ? 'doctor_id' : 'mother_id';
  const exists = await pool.query(`SELECT 1 FROM conversations WHERE id = $1 AND ${ownColumn} = $2`, [conversationId, userId]);
  if (exists.rowCount === 0) return null;

  const otherSenderRole = role === 'doctor' ? 'patient' : 'doctor';
  await pool.query(`UPDATE messages SET read_at = now() WHERE conversation_id = $1 AND sender_role = $2 AND read_at IS NULL`, [
    conversationId,
    otherSenderRole,
  ]);

  const conversation = await fetchConversationSummary(userId, role, conversationId);
  if (!conversation) return null;

  const messagesResult = await pool.query<MessageRow>(
    `SELECT m.id AS message_id, m.conversation_id, m.sender_user_id, m.sender_role,
            u.name AS sender_name, m.body, m.sent_at, m.read_at
     FROM messages m
     JOIN users u ON u.id = m.sender_user_id
     WHERE m.conversation_id = $1
     ORDER BY m.sent_at ASC`,
    [conversationId]
  );

  return { conversation, messages: messagesResult.rows };
}

/**
 * sender_user_id/sender_role are never accepted from the client — sender_role
 * is derived from the verified JWT role via toSenderRole, and sender_user_id
 * is req.user.id. A non-participant gets a 404 (not 403) so a conversation's
 * existence isn't leaked to accounts that aren't in it.
 */
export async function createMessage(
  userId: string,
  role: MessageParticipantRole,
  conversationId: string,
  text: string
): Promise<MessageRow> {
  const ownColumn = role === 'doctor' ? 'doctor_id' : 'mother_id';
  const exists = await pool.query(`SELECT 1 FROM conversations WHERE id = $1 AND ${ownColumn} = $2`, [conversationId, userId]);
  if (exists.rowCount === 0) {
    throw new AuthError('Conversation not found for this account.', 404);
  }

  const senderRole = toSenderRole(role);
  const inserted = await pool.query<{
    message_id: string;
    conversation_id: string;
    sender_user_id: string;
    sender_role: string;
    body: string;
    sent_at: string;
    read_at: string | null;
  }>(
    `INSERT INTO messages (conversation_id, sender_user_id, sender_role, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id AS message_id, conversation_id, sender_user_id, sender_role, body, sent_at, read_at`,
    [conversationId, userId, senderRole, text]
  );
  await pool.query(`UPDATE conversations SET updated_at = now() WHERE id = $1`, [conversationId]);

  const senderNameResult = await pool.query<{ name: string }>(`SELECT name FROM users WHERE id = $1`, [userId]);
  return { ...inserted.rows[0], sender_name: senderNameResult.rows[0]?.name ?? '' };
}

async function upsertConversation(doctorId: string, motherId: string): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO conversations (doctor_id, mother_id, status, priority)
     VALUES ($1, $2, 'active', 'normal')
     ON CONFLICT (doctor_id, mother_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [doctorId, motherId]
  );
  return result.rows[0].id;
}

/**
 * Mother-initiated only. She never picks a doctor id herself — doctorId is
 * resolved from her own active patient_care_records assignment, the same
 * relationship requestMyAppointment() (Phase 6 Part 4) already derives
 * doctor_id from. No active assignment means no conversation can be started
 * — a real missing-relationship case, not an invented restriction.
 */
export async function findOrCreateConversationForMother(motherId: string): Promise<ConversationRow> {
  const care = await pool.query<{ doctor_id: string }>(
    `SELECT doctor_id FROM patient_care_records WHERE mother_id = $1 AND is_active = true`,
    [motherId]
  );
  const doctorId = care.rows[0]?.doctor_id;
  if (!doctorId) {
    throw new AuthError(
      'No active care assignment found for this account. A conversation cannot be started until a doctor is assigned.',
      404
    );
  }
  const conversationId = await upsertConversation(doctorId, motherId);
  const summary = await fetchConversationSummary(motherId, 'mother', conversationId);
  if (!summary) throw new Error('Conversation was created but could not be re-read.');
  return summary;
}

/**
 * Doctor-initiated. motherId is client-supplied (it has to be — the server
 * can't otherwise know who a doctor wants to message) but is only ever used
 * once a patient_care_records row proves this mother is actually one of this
 * doctor's patients; a doctor cannot start a conversation with an arbitrary
 * mother by guessing an id.
 */
export async function findOrCreateConversationForDoctor(doctorId: string, motherId: string): Promise<ConversationRow> {
  const care = await pool.query(`SELECT 1 FROM patient_care_records WHERE doctor_id = $1 AND mother_id = $2`, [
    doctorId,
    motherId,
  ]);
  if (care.rowCount === 0) {
    throw new AuthError('This mother is not one of your patients.', 403);
  }
  const conversationId = await upsertConversation(doctorId, motherId);
  const summary = await fetchConversationSummary(doctorId, 'doctor', conversationId);
  if (!summary) throw new Error('Conversation was created but could not be re-read.');
  return summary;
}

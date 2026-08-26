// ---------------------------------------------------------------------------
// Real backend client for Mother <-> Doctor messaging (Phase 6 Part 13).
// Shared by DoctorMessagesPage and the Mother "Message Your Care Team" flow
// (MotherDoctorPage/MessageDoctorModal) — both roles hit the same
// /api/messages/* routes over the same conversations/messages tables; the
// server resolves "doctor" vs "mother" scoping from the authenticated JWT,
// never from anything this client passes. No mock fallback: every method
// requires a real JWT.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import { ConversationWithMeta, DoctorMessage, MessageConversation } from '@/types';

export class NotAuthenticatedError extends AuthApiError {}

function getToken(): string {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    throw new NotAuthenticatedError('Sign in with your real account to view this data.');
  }
  return token;
}

async function authedFetch(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.message === 'string' ? body.message : `Request failed with status ${res.status}.`;
    throw new AuthApiError(message);
  }
  return body;
}

const get = (path: string) => authedFetch(path);
const post = (path: string, body?: unknown) => authedFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

interface ConversationRowShape {
  conversation_id: string;
  doctor_id: string;
  mother_id: string;
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

interface MessageRowShape {
  message_id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: string;
  sender_name: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

// patientId/patientName are the existing MessageConversation field names
// (this type predates real data and was written doctor-first) — from the
// mother's side, "patientName" is really her doctor's name, and patientId is
// meaningless there and left empty; reusing one type keeps a single shared
// service usable by both roles instead of duplicating it.
function toConversation(row: ConversationRowShape): ConversationWithMeta {
  return {
    conversationId: row.conversation_id,
    doctorId: row.doctor_id,
    patientId: row.patient_id ?? '',
    patientName: row.other_party_name,
    status: (row.status as MessageConversation['status']) ?? 'active',
    priority: (row.priority as MessageConversation['priority']) ?? 'normal',
    unreadCount: row.unread_count,
    lastMessage: row.last_message_id
      ? {
          messageId: row.last_message_id,
          conversationId: row.conversation_id,
          sender: (row.last_message_sender_role as DoctorMessage['sender']) ?? 'patient',
          senderName: '',
          text: row.last_message_body ?? '',
          timestamp: row.last_message_sent_at ?? '',
        }
      : undefined,
  };
}

function toMessage(row: MessageRowShape): DoctorMessage {
  return {
    messageId: row.message_id,
    conversationId: row.conversation_id,
    sender: (row.sender_role as DoctorMessage['sender']) ?? 'patient',
    senderName: row.sender_name,
    text: row.body,
    timestamp: row.sent_at,
  };
}

export async function getMyConversations(): Promise<ConversationWithMeta[]> {
  const body = await get('/messages/conversations');
  return ((body.conversations as ConversationRowShape[]) ?? []).map(toConversation);
}

export async function getConversation(
  conversationId: string
): Promise<{ conversation: ConversationWithMeta; messages: DoctorMessage[] }> {
  const body = await get(`/messages/conversations/${conversationId}`);
  return {
    conversation: toConversation(body.conversation as ConversationRowShape),
    messages: ((body.messages as MessageRowShape[]) ?? []).map(toMessage),
  };
}

export async function sendMessage(conversationId: string, text: string): Promise<DoctorMessage> {
  const body = await post(`/messages/conversations/${conversationId}/messages`, { text });
  return toMessage(body.message as MessageRowShape);
}

// Mother-initiated only — the server resolves her doctor from her own active
// care assignment, the same relationship requestMyAppointment() (Phase 6
// Part 4) already derives doctor_id from; she never picks a doctor id.
export async function startConversationWithMyDoctor(): Promise<ConversationWithMeta> {
  const body = await post('/messages/conversations');
  return toConversation(body.conversation as ConversationRowShape);
}

// Doctor-initiated — not wired into any current UI (DoctorMessagesPage only
// ever selects an existing conversation), but exposed since the shared
// service is meant to cover both directions the backend supports.
export async function startConversationWithMother(motherId: string): Promise<ConversationWithMeta> {
  const body = await post('/messages/conversations', { motherId });
  return toConversation(body.conversation as ConversationRowShape);
}

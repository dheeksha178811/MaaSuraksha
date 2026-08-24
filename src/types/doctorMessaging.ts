// ---------------------------------------------------------------------------
// Doctor-side "Care Messages & Consults" module.
// Conversations and messages reference existing `AssignedPatient` records via
// patientId — no patient identity is duplicated here. Everything carries its
// own stable conversationId/messageId so this can migrate directly to a
// `conversations` / `messages` collection in MongoDB later. Today these are
// only ever read from mock arrays and mutated in local React state — no
// network calls are made.
// ---------------------------------------------------------------------------

export type ConversationStatus = 'active' | 'resolved';
export type MessagePriority = 'normal' | 'urgent';
export type MessageSender = 'doctor' | 'patient';

export interface DoctorMessage {
  messageId: string;
  conversationId: string;
  sender: MessageSender;
  senderName: string;
  text: string;
  timestamp: string; // ISO datetime
}

export interface MessageConversation {
  conversationId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  status: ConversationStatus;
  priority: MessagePriority;
  unreadCount: number;
}

export interface ConversationWithMeta extends MessageConversation {
  lastMessage?: DoctorMessage;
}

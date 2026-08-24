import { mockDoctor } from '@/data/mockData';
import { ConversationWithMeta, DoctorMessage, MessageConversation } from '@/types';

/**
 * Fixed "now" reference for this mock dataset, matching DOCTOR_TODAY_ISO in
 * doctorPatientsMockData.ts so message timestamps agree with the rest of the
 * doctor-side mock data on what counts as "today" / "recent".
 */
export const DOCTOR_MESSAGES_NOW_ISO = '2026-08-23T09:15:00';

/**
 * Conversations reference the SAME patientId/patientName used by the
 * `AssignedPatient` records in doctorPatientsMockData.ts — no patient
 * identity is duplicated here.
 */
export const messageConversations: MessageConversation[] = [
  {
    conversationId: 'conv_01',
    doctorId: mockDoctor.id,
    patientId: 'pat_01',
    patientName: 'Ananya Kapoor',
    status: 'active',
    priority: 'normal',
    unreadCount: 1,
  },
  {
    conversationId: 'conv_02',
    doctorId: mockDoctor.id,
    patientId: 'pat_02',
    patientName: 'Meera Iyer',
    status: 'active',
    priority: 'normal',
    unreadCount: 0,
  },
  {
    conversationId: 'conv_03',
    doctorId: mockDoctor.id,
    patientId: 'pat_04',
    patientName: 'Kavya Reddy',
    status: 'active',
    priority: 'urgent',
    unreadCount: 1,
  },
  {
    conversationId: 'conv_04',
    doctorId: mockDoctor.id,
    patientId: 'pat_07',
    patientName: 'Ritika Verma',
    status: 'active',
    priority: 'normal',
    unreadCount: 0,
  },
  {
    conversationId: 'conv_05',
    doctorId: mockDoctor.id,
    patientId: 'pat_08',
    patientName: 'Pooja Nayar',
    status: 'resolved',
    priority: 'normal',
    unreadCount: 0,
  },
];

export const doctorMessages: DoctorMessage[] = [
  // conv_01 — Ananya Kapoor
  {
    messageId: 'msg_01',
    conversationId: 'conv_01',
    sender: 'patient',
    senderName: 'Ananya Kapoor',
    text: 'Doctor, I have been having mild discomfort near the incision area since yesterday.',
    timestamp: '2026-08-22T18:40:00',
  },
  {
    messageId: 'msg_02',
    conversationId: 'conv_01',
    sender: 'doctor',
    senderName: mockDoctor.name,
    text: 'Please monitor it and let me know if it becomes stronger or regular, or if you notice redness or discharge.',
    timestamp: '2026-08-22T19:05:00',
  },
  {
    messageId: 'msg_03',
    conversationId: 'conv_01',
    sender: 'patient',
    senderName: 'Ananya Kapoor',
    text: "It's a little better today, but I still feel slight tenderness when I press near the area.",
    timestamp: '2026-08-23T08:10:00',
  },

  // conv_02 — Meera Iyer
  {
    messageId: 'msg_04',
    conversationId: 'conv_02',
    sender: 'patient',
    senderName: 'Meera Iyer',
    text: 'Hi doctor, is it okay to eat mango in moderation? I have been craving it but worried about my sugar levels.',
    timestamp: '2026-08-21T17:20:00',
  },
  {
    messageId: 'msg_05',
    conversationId: 'conv_02',
    sender: 'doctor',
    senderName: mockDoctor.name,
    text: "A small portion after a meal should be fine — let's check your next fasting reading and adjust if needed.",
    timestamp: '2026-08-21T18:02:00',
  },

  // conv_03 — Kavya Reddy (high-risk, urgent)
  {
    messageId: 'msg_06',
    conversationId: 'conv_03',
    sender: 'patient',
    senderName: 'Kavya Reddy',
    text: 'Doctor, I have had a bad headache since this morning and my vision feels a little blurry.',
    timestamp: '2026-08-23T07:50:00',
  },

  // conv_04 — Ritika Verma
  {
    messageId: 'msg_07',
    conversationId: 'conv_04',
    sender: 'patient',
    senderName: 'Ritika Verma',
    text: 'Hi doctor, still feeling quite tired even after starting the iron tablets.',
    timestamp: '2026-08-20T09:15:00',
  },
  {
    messageId: 'msg_08',
    conversationId: 'conv_04',
    sender: 'doctor',
    senderName: mockDoctor.name,
    text: "That's expected in the first couple of weeks. Let's recheck your haemoglobin — can you come in for your follow-up this week?",
    timestamp: '2026-08-20T10:00:00',
  },
  {
    messageId: 'msg_09',
    conversationId: 'conv_04',
    sender: 'patient',
    senderName: 'Ritika Verma',
    text: 'Yes, I can come on Thursday.',
    timestamp: '2026-08-20T10:12:00',
  },

  // conv_05 — Pooja Nayar (resolved thread)
  {
    messageId: 'msg_10',
    conversationId: 'conv_05',
    sender: 'patient',
    senderName: 'Pooja Nayar',
    text: 'Thank you for the registration visit today!',
    timestamp: '2026-08-19T12:30:00',
  },
  {
    messageId: 'msg_11',
    conversationId: 'conv_05',
    sender: 'doctor',
    senderName: mockDoctor.name,
    text: "You're welcome, Pooja. Welcome to MaaSuraksha care — see you at your next visit.",
    timestamp: '2026-08-19T12:45:00',
  },
];

export const getConversationsForDoctor = (doctorId: string): MessageConversation[] =>
  messageConversations.filter((c) => c.doctorId === doctorId);

export const getMessagesForConversation = (conversationId: string): DoctorMessage[] =>
  doctorMessages
    .filter((m) => m.conversationId === conversationId)
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

export const getConversationsForDoctorWithMeta = (doctorId: string): ConversationWithMeta[] => {
  const withMeta = getConversationsForDoctor(doctorId).map((conversation) => {
    const conversationMessages = getMessagesForConversation(conversation.conversationId);
    return { ...conversation, lastMessage: conversationMessages[conversationMessages.length - 1] };
  });
  return withMeta.sort((a, b) => (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || ''));
};

let messageSequence = doctorMessages.length;

/**
 * Builds a new outgoing doctor message. Frontend-only: the caller is
 * responsible for holding the returned record in local state since there is
 * no backend to persist it yet.
 */
export const buildOutgoingDoctorMessage = (conversationId: string, text: string): DoctorMessage => {
  messageSequence += 1;
  return {
    messageId: `msg_${String(messageSequence).padStart(2, '0')}`,
    conversationId,
    sender: 'doctor',
    senderName: mockDoctor.name,
    text,
    timestamp: DOCTOR_MESSAGES_NOW_ISO,
  };
};

export const markConversationRead = (
  conversations: MessageConversation[],
  conversationId: string
): MessageConversation[] =>
  conversations.map((c) => (c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c));

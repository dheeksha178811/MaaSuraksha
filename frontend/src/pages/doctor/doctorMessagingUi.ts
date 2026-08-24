import { ConversationStatus, MessagePriority } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getConversationStatusBadgeVariant = (status: ConversationStatus): BadgeVariant =>
  status === 'active' ? 'sage' : 'outline';

export const getConversationStatusLabel = (status: ConversationStatus): string =>
  status === 'active' ? 'Active' : 'Resolved';

export const getMessagePriorityBadgeVariant = (priority: MessagePriority): BadgeVariant =>
  priority === 'urgent' ? 'danger' : 'outline';

export const QUICK_REPLIES: string[] = [
  'Please monitor it and let me know if it changes.',
  "That's expected — let's discuss at your next visit.",
  'Please come in for a check-up as soon as you can.',
];

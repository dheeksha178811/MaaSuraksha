import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { ConversationWithMeta } from '@/types';
import { DOCTOR_MESSAGES_NOW_ISO } from '@/data/doctorMessagesMockData';
import { formatClinicalTimestamp } from '@/pages/doctor/doctorUi';
import { getConversationStatusBadgeVariant, getConversationStatusLabel } from '@/pages/doctor/doctorMessagingUi';

export interface ConversationListItemProps {
  conversation: ConversationWithMeta;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onSelect,
}) => {
  const isUnread = conversation.unreadCount > 0;

  return (
    <button
      onClick={() => onSelect(conversation.conversationId)}
      className={cn(
        'w-full text-left p-3.5 rounded-2xl border transition-colors',
        isSelected
          ? 'bg-sandal-50 border-sandal-300 shadow-warm-sm'
          : 'bg-white border-sandal-100/80 hover:border-sandal-200 hover:bg-warm-cream/60'
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={conversation.patientName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('text-sm truncate', isUnread ? 'font-bold text-warm-brown' : 'font-semibold text-warm-brown')}>
              {conversation.patientName}
            </span>
            {conversation.lastMessage && (
              <span className="text-[10px] text-warm-muted shrink-0">
                {formatClinicalTimestamp(conversation.lastMessage.timestamp, DOCTOR_MESSAGES_NOW_ISO)}
              </span>
            )}
          </div>
          <p className={cn('text-xs truncate mt-0.5', isUnread ? 'text-warm-brown font-medium' : 'text-warm-muted')}>
            {conversation.lastMessage
              ? `${conversation.lastMessage.sender === 'doctor' ? 'You: ' : ''}${conversation.lastMessage.text}`
              : 'No messages yet'}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            {conversation.priority === 'urgent' && (
              <Badge variant="danger" size="sm" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Urgent
              </Badge>
            )}
            <Badge variant={getConversationStatusBadgeVariant(conversation.status)} size="sm">
              {getConversationStatusLabel(conversation.status)}
            </Badge>
            {isUnread && (
              <span className="ml-auto w-5 h-5 rounded-full bg-sandal-500 text-white text-[10px] font-semibold flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

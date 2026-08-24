import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Info, Stethoscope, User, Video } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils/cn';
import { AssignedPatient, ConversationWithMeta, DoctorMessage } from '@/types';
import { DOCTOR_MESSAGES_NOW_ISO } from '@/data/doctorMessagesMockData';
import { formatClinicalTimestamp, getPatientStageSummary } from '@/pages/doctor/doctorUi';
import { getConversationStatusBadgeVariant, getConversationStatusLabel } from '@/pages/doctor/doctorMessagingUi';
import { MessageComposer } from './MessageComposer';

export interface ConversationThreadProps {
  conversation: ConversationWithMeta;
  patient: AssignedPatient;
  messages: DoctorMessage[];
  onSend: (text: string) => void;
  onBack?: () => void;
  onToggleContext?: () => void;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  conversation,
  patient,
  messages,
  onSend,
  onBack,
  onToggleContext,
}) => {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-sandal-100">
        <div className="flex items-start gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to conversations"
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-warm-muted hover:bg-warm-cream shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Avatar name={patient.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg font-bold text-warm-brown truncate">{patient.name}</h3>
              {conversation.priority === 'urgent' && <Badge variant="danger" size="sm">Urgent</Badge>}
              <Badge variant={getConversationStatusBadgeVariant(conversation.status)} size="sm">
                {getConversationStatusLabel(conversation.status)}
              </Badge>
            </div>
            <p className="text-xs text-warm-muted mt-0.5">{getPatientStageSummary(patient)}</p>
          </div>
        </div>
        {onToggleContext && (
          <IconButton aria-label="Toggle patient context" variant="outline" size="sm" className="lg:hidden shrink-0" onClick={onToggleContext}>
            <Info className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {/* Consultation Actions */}
      <div className="flex flex-wrap gap-2 py-3 border-b border-sandal-100/70">
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
          onClick={() => alert(`Starting consultation with ${patient.name}. In production, this would open a secure consult workspace.`)}
        >
          Start Consultation
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Video className="w-3.5 h-3.5" />}
          onClick={() => alert(`Requesting a video consultation with ${patient.name}. In production, this would launch a secure video session.`)}
        >
          Request Video Consult
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<CalendarPlus className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
        >
          Schedule Follow-up
        </Button>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<User className="w-3.5 h-3.5" />}
          onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
        >
          View Patient
        </Button>
      </div>

      {/* Message History */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => {
          const isDoctor = message.sender === 'doctor';
          return (
            <div key={message.messageId} className={cn('flex flex-col', isDoctor ? 'items-end' : 'items-start')}>
              <span className="text-[10px] text-warm-muted mb-1 px-1">
                {isDoctor ? 'You' : message.senderName} • {formatClinicalTimestamp(message.timestamp, DOCTOR_MESSAGES_NOW_ISO)}
              </span>
              <div
                className={cn(
                  'max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  isDoctor
                    ? 'bg-sandal-500 text-white rounded-br-sm'
                    : 'bg-white border border-sandal-100 text-warm-brown rounded-bl-sm shadow-subtle'
                )}
              >
                {message.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={onSend} disabled={conversation.status === 'resolved'} />
    </div>
  );
};

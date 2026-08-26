import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { DoctorMessage } from '@/types';

export interface MotherConversationThreadProps {
  doctorName: string;
  hospitalName?: string;
  messages: DoctorMessage[];
  onSend: (text: string) => Promise<void>;
}

// Mother-side thread view — same bubble/composer visual language as the
// Doctor's ConversationThread.tsx, without the doctor-only consultation
// actions or the AssignedPatient dependency (a mother isn't viewing a
// patient record here, she's viewing her own conversation with her doctor).
export const MotherConversationThread: React.FC<MotherConversationThreadProps> = ({
  doctorName,
  hospitalName,
  messages,
  onSend,
}) => {
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!draft.trim() || isSending) return;
    setIsSending(true);
    setSendError(null);
    try {
      await onSend(draft.trim());
      setDraft('');
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b border-sandal-100">
        <h3 className="font-display text-lg font-bold text-warm-brown truncate">{doctorName}</h3>
        {hospitalName && <p className="text-xs text-warm-muted mt-0.5">{hospitalName}</p>}
      </div>

      {/* Message History */}
      <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-warm-muted text-center py-10">
            No messages yet. Say hello to your care team below.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender === 'patient';
            return (
              <div key={message.messageId} className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
                <span className="text-[10px] text-warm-muted mb-1 px-1">
                  {isMine ? 'You' : message.senderName}
                </span>
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    isMine
                      ? 'bg-sandal-500 text-white rounded-br-sm'
                      : 'bg-white border border-sandal-100 text-warm-brown rounded-bl-sm shadow-subtle'
                  )}
                >
                  {message.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-sandal-100 pt-3 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Type a message to your care team..."
          className="w-full resize-none px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
        />
        {sendError && <p className="text-xs text-rose-600">{sendError}</p>}
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={!draft.trim() || isSending} leftIcon={<Send className="w-4 h-4" />}>
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

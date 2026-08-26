import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import * as messageService from '@/services/messageService';
import { ConversationWithMeta, DoctorMessage } from '@/types';

interface MessageDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  hospitalName: string;
}

type ThreadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; conversation: ConversationWithMeta; messages: DoctorMessage[] };

// Real conversation thread with her assigned doctor — find-or-create +
// fetch on every open (so a page reload followed by reopening this modal
// always shows the real, persisted messages, never stale local state), plus
// a composer that posts through the same real endpoint. No mock fallback:
// a fetch/send failure surfaces as an inline error, never fabricated data.
export const MessageDoctorModal: React.FC<MessageDoctorModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  hospitalName,
}) => {
  const [state, setState] = useState<ThreadState>({ status: 'loading' });
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadThread = async () => {
    setState({ status: 'loading' });
    try {
      const conversation = await messageService.startConversationWithMyDoctor();
      const detail = await messageService.getConversation(conversation.conversationId);
      setState({ status: 'success', conversation: detail.conversation, messages: detail.messages });
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to load your messages. Please try again.',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDraft('');
      setSendError(null);
      loadThread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSend = async () => {
    if (!draft.trim() || state.status !== 'success' || isSending) return;
    setIsSending(true);
    setSendError(null);
    try {
      const sent = await messageService.sendMessage(state.conversation.conversationId, draft.trim());
      setState({ ...state, messages: [...state.messages, sent] });
      setDraft('');
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Message Your Care Team"
      description={`With ${doctorName} at ${hospitalName}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {state.status === 'loading' && (
          <div className="flex items-center justify-center gap-2.5 py-10 text-sm text-warm-muted">
            <span className="w-4 h-4 rounded-full border-2 border-sandal-200 border-t-sandal-600 animate-spin" />
            Loading your messages…
          </div>
        )}

        {state.status === 'error' && (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-rose-600">{state.message}</p>
            <Button variant="outline" size="sm" onClick={loadThread}>Retry</Button>
          </div>
        )}

        {state.status === 'success' && (
          <>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {state.messages.length === 0 ? (
                <p className="text-xs text-warm-muted text-center py-6">
                  No messages yet. Say hello to your care team below.
                </p>
              ) : (
                state.messages.map((message) => {
                  const isMine = message.sender === 'patient';
                  return (
                    <div key={message.messageId} className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
                      <span className="text-[10px] text-warm-muted mb-1 px-1">
                        {isMine ? 'You' : message.senderName}
                      </span>
                      <div
                        className={cn(
                          'max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                          isMine
                            ? 'bg-sandal-500 text-white rounded-br-sm'
                            : 'bg-warm-ivory border border-sandal-100 text-warm-brown rounded-bl-sm'
                        )}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-sandal-100">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="e.g., I have a question about my feeding schedule before the next visit..."
                className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
              />
              {sendError && <p className="text-xs text-rose-600">{sendError}</p>}
              <p className="text-xs text-warm-muted">
                This is routed to your care team at {hospitalName} and is not for emergencies. For urgent concerns,
                use the Emergency Hotline instead.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button
                  onClick={handleSend}
                  disabled={!draft.trim() || isSending}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

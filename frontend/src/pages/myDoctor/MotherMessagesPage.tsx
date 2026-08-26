import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import * as messageService from '@/services/messageService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { ConversationWithMeta, DoctorMessage } from '@/types';
import { ConversationListItem } from '@/pages/doctor/components/ConversationListItem';
import { MotherConversationThread } from './components/MotherConversationThread';

export const MotherMessagesPage: React.FC = () => {
  // Resolves (find-or-creates) her conversation with her assigned doctor —
  // the same call MessageDoctorModal.tsx already makes — so the thread is
  // ready to view/reply to immediately, without her having to take an extra
  // "start conversation" step. If she has no active care assignment at all,
  // this surfaces that real backend error instead of a fabricated empty
  // conversation.
  const [resolveState, retryResolve] = useAsyncData(() => messageService.startConversationWithMyDoctor(), []);

  const [conversationsState, reloadConversations] = useAsyncData(() => messageService.getMyConversations(), []);
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  useEffect(() => {
    if (conversationsState.status === 'success') setConversations(conversationsState.data);
  }, [conversationsState]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (resolveState.status === 'success' && !selectedId) {
      setSelectedId(resolveState.data.conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolveState]);

  const [threadState, reloadThread] = useAsyncData(
    () => (selectedId ? messageService.getConversation(selectedId) : Promise.resolve(null)),
    [selectedId]
  );
  const [messages, setMessages] = useState<DoctorMessage[]>([]);

  useEffect(() => {
    if (threadState.status === 'success' && threadState.data) {
      const { conversation, messages: threadMessages } = threadState.data;
      setMessages(threadMessages);
      setConversations((prev) => {
        const exists = prev.some((c) => c.conversationId === conversation.conversationId);
        if (exists) {
          return prev.map((c) =>
            c.conversationId === conversation.conversationId ? { ...c, ...conversation, unreadCount: 0 } : c
          );
        }
        return [conversation, ...prev];
      });
    }
  }, [threadState]);

  const openConversation =
    threadState.status === 'success' && threadState.data
      ? threadState.data.conversation
      : conversations.find((c) => c.conversationId === selectedId);

  const handleSend = async (text: string) => {
    if (!selectedId) return;
    const sent = await messageService.sendMessage(selectedId, text);
    setMessages((prev) => [...prev, sent]);
    setConversations((prev) => prev.map((c) => (c.conversationId === selectedId ? { ...c, lastMessage: sent } : c)));
  };

  if (resolveState.status !== 'success') {
    return (
      <div className="space-y-6">
        <PageHeader title="Messages" subtitle="Your conversation with your care team." />
        <AsyncStateView
          status={resolveState.status}
          loadingLabel="Loading your messages…"
          errorMessage={resolveState.status === 'error' ? resolveState.message : undefined}
          onRetry={retryResolve}
        />
      </div>
    );
  }

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle={`Your conversation with ${resolveState.data.patientName}.`}
        badge={<Badge variant="sandal">{unreadTotal} Unread</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Conversation List */}
        <div className={cn('lg:col-span-4', selectedId && 'hidden lg:block')}>
          <Card padding="md" className="flex flex-col lg:h-[70vh]">
            <div className="flex-1 overflow-y-auto space-y-2 lg:min-h-0">
              {conversationsState.status !== 'success' ? (
                <AsyncStateView
                  status={conversationsState.status}
                  loadingLabel="Loading conversations…"
                  errorMessage={conversationsState.status === 'error' ? conversationsState.message : undefined}
                  onRetry={reloadConversations}
                />
              ) : conversations.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No messages yet"
                  description="Messages with your assigned doctor will appear here."
                />
              ) : (
                conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.conversationId}
                    conversation={conversation}
                    isSelected={conversation.conversationId === selectedId}
                    onSelect={setSelectedId}
                  />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Conversation Thread */}
        <div className={cn('lg:col-span-8', !selectedId && 'hidden lg:block')}>
          <Card padding="lg" className="lg:h-[70vh] flex flex-col">
            {threadState.status !== 'success' || !threadState.data || !openConversation ? (
              <AsyncStateView
                status={threadState.status === 'error' ? 'error' : 'loading'}
                loadingLabel="Loading conversation…"
                errorMessage={threadState.status === 'error' ? threadState.message : undefined}
                onRetry={reloadThread}
              />
            ) : (
              <MotherConversationThread doctorName={openConversation.patientName} messages={messages} onSend={handleSend} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

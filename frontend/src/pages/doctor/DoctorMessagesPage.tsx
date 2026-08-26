import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, MessageCircle, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import * as doctorService from '@/services/doctorService';
import * as messageService from '@/services/messageService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { ConversationWithMeta, DoctorMessage } from '@/types';
import { ConversationListItem } from '@/pages/doctor/components/ConversationListItem';
import { ConversationThread } from '@/pages/doctor/components/ConversationThread';
import { PatientContextPanel } from '@/pages/doctor/components/PatientContextPanel';

type ConversationFilter = 'ALL' | 'UNREAD' | 'URGENT' | 'RECENT';

const FILTER_OPTIONS: { value: ConversationFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'RECENT', label: 'Recent' },
];

export const DoctorMessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [conversationsState, reloadConversations] = useAsyncData(() => messageService.getMyConversations(), []);
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  useEffect(() => {
    if (conversationsState.status === 'success') setConversations(conversationsState.data);
  }, [conversationsState]);

  const [patientsState] = useAsyncData(() => doctorService.getMyPatients(), []);
  const patients = patientsState.status === 'success' ? patientsState.data : [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('ALL');

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

  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setShowMobileContext(false);
  };

  // Deep-link support from Doctor Notifications: /doctor/messages?conversation=conv_XX
  useEffect(() => {
    const requested = searchParams.get('conversation');
    if (requested) handleSelectConversation(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'UNREAD') list = list.filter((c) => c.unreadCount > 0);
    if (filter === 'URGENT') list = list.filter((c) => c.priority === 'urgent');
    if (filter === 'RECENT') {
      const today = new Date().toISOString().slice(0, 10);
      list = list.filter((c) => c.lastMessage?.timestamp.slice(0, 10) === today);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => c.patientName.toLowerCase().includes(q));
    }
    return list.slice().sort((a, b) => (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || ''));
  }, [conversations, filter, searchQuery]);

  const unreadTotal = useMemo(() => conversations.reduce((sum, c) => sum + c.unreadCount, 0), [conversations]);

  const openConversation =
    threadState.status === 'success' && threadState.data
      ? threadState.data.conversation
      : conversations.find((c) => c.conversationId === selectedId);
  const selectedPatient = openConversation ? patients.find((p) => p.patientId === openConversation.patientId) : undefined;

  const handleSend = async (text: string) => {
    if (!selectedId) return;
    try {
      const sent = await messageService.sendMessage(selectedId, text);
      setMessages((prev) => [...prev, sent]);
      setConversations((prev) => prev.map((c) => (c.conversationId === selectedId ? { ...c, lastMessage: sent } : c)));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to send message. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Care Messages & Consults"
        subtitle="Communicate securely with your assigned mothers and care team."
        badge={<Badge variant="sandal">{unreadTotal} Unread</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Conversation List */}
        <div className={cn('lg:col-span-3', selectedId && 'hidden lg:block')}>
          <Card padding="md" className="flex flex-col lg:h-[70vh]">
            <div className="space-y-3 shrink-0">
              <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
                <Filter className="w-4 h-4 text-sandal-600" />
                Search & Filter
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
                <Input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                aria-label="Filter conversations"
                value={filter}
                onChange={(e) => setFilter(e.target.value as ConversationFilter)}
                options={FILTER_OPTIONS}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pt-4 mt-3 border-t border-sandal-100/70 lg:min-h-0">
              {conversationsState.status !== 'success' ? (
                <AsyncStateView
                  status={conversationsState.status}
                  loadingLabel="Loading conversations…"
                  errorMessage={conversationsState.status === 'error' ? conversationsState.message : undefined}
                  onRetry={reloadConversations}
                />
              ) : filteredConversations.length === 0 ? (
                <p className="text-xs text-warm-muted text-center py-8">No conversations match this filter.</p>
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.conversationId}
                    conversation={conversation}
                    isSelected={conversation.conversationId === selectedId}
                    onSelect={handleSelectConversation}
                  />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Conversation Thread */}
        <div className={cn('lg:col-span-6', !selectedId && 'hidden lg:block')}>
          <Card padding="lg" className="lg:h-[70vh] flex flex-col">
            {!selectedId ? (
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                description="Choose a mother from the list to view messages and respond."
              />
            ) : threadState.status !== 'success' || !threadState.data ? (
              <AsyncStateView
                status={threadState.status === 'error' ? 'error' : 'loading'}
                loadingLabel="Loading conversation…"
                errorMessage={threadState.status === 'error' ? threadState.message : undefined}
                onRetry={reloadThread}
              />
            ) : selectedPatient && openConversation ? (
              <ConversationThread
                conversation={openConversation}
                patient={selectedPatient}
                messages={messages}
                onSend={handleSend}
                onBack={() => setSelectedId(null)}
                onToggleContext={() => setShowMobileContext((v) => !v)}
              />
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="Patient record unavailable"
                description="This conversation's patient could not be matched to your current roster."
              />
            )}
          </Card>
        </div>

        {/* Patient Context */}
        <div
          className={cn(
            'lg:col-span-3',
            selectedId ? (showMobileContext ? 'block' : 'hidden lg:block') : 'hidden'
          )}
        >
          {selectedPatient && <PatientContextPanel patient={selectedPatient} />}
        </div>
      </div>
    </div>
  );
};

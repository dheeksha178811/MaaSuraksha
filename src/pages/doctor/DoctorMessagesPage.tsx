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
import { mockDoctor } from '@/data/mockData';
import { getPatientById } from '@/data/doctorPatientsMockData';
import {
  DOCTOR_MESSAGES_NOW_ISO,
  buildOutgoingDoctorMessage,
  doctorMessages,
  getConversationsForDoctor,
  markConversationRead,
} from '@/data/doctorMessagesMockData';
import { ConversationWithMeta, DoctorMessage, MessageConversation } from '@/types';
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
  const doctorId = mockDoctor.id;
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<MessageConversation[]>(() => getConversationsForDoctor(doctorId));
  const [messages, setMessages] = useState<DoctorMessage[]>(() => {
    const ids = new Set(getConversationsForDoctor(doctorId).map((c) => c.conversationId));
    return doctorMessages.filter((m) => ids.has(m.conversationId));
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('ALL');

  const handleSelectConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setShowMobileContext(false);
    setConversations((prev) => markConversationRead(prev, conversationId));
  };

  // Deep-link support from Doctor Notifications: /doctor/messages?conversation=conv_XX
  useEffect(() => {
    const requested = searchParams.get('conversation');
    if (requested) handleSelectConversation(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastMessageByConversation = useMemo(() => {
    const map = new Map<string, DoctorMessage>();
    messages.forEach((m) => {
      const existing = map.get(m.conversationId);
      if (!existing || m.timestamp > existing.timestamp) map.set(m.conversationId, m);
    });
    return map;
  }, [messages]);

  const conversationsWithMeta: ConversationWithMeta[] = useMemo(
    () =>
      conversations
        .map((c) => ({ ...c, lastMessage: lastMessageByConversation.get(c.conversationId) }))
        .sort((a, b) => (b.lastMessage?.timestamp || '').localeCompare(a.lastMessage?.timestamp || '')),
    [conversations, lastMessageByConversation]
  );

  const filteredConversations = useMemo(() => {
    let list = conversationsWithMeta;
    if (filter === 'UNREAD') list = list.filter((c) => c.unreadCount > 0);
    if (filter === 'URGENT') list = list.filter((c) => c.priority === 'urgent');
    if (filter === 'RECENT') {
      const today = DOCTOR_MESSAGES_NOW_ISO.slice(0, 10);
      list = list.filter((c) => c.lastMessage?.timestamp.slice(0, 10) === today);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => c.patientName.toLowerCase().includes(q));
    }
    return list;
  }, [conversationsWithMeta, filter, searchQuery]);

  const unreadTotal = useMemo(() => conversations.reduce((sum, c) => sum + c.unreadCount, 0), [conversations]);

  const selectedConversation = conversationsWithMeta.find((c) => c.conversationId === selectedId);
  const selectedPatient = selectedConversation ? getPatientById(selectedConversation.patientId) : undefined;
  const selectedMessages = useMemo(
    () =>
      selectedId
        ? messages.filter((m) => m.conversationId === selectedId).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        : [],
    [messages, selectedId]
  );

  const handleSend = (text: string) => {
    if (!selectedId) return;
    const newMessage = buildOutgoingDoctorMessage(selectedId, text);
    setMessages((prev) => [...prev, newMessage]);
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
              {filteredConversations.length === 0 ? (
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
            {selectedConversation && selectedPatient ? (
              <ConversationThread
                conversation={selectedConversation}
                patient={selectedPatient}
                messages={selectedMessages}
                onSend={handleSend}
                onBack={() => setSelectedId(null)}
                onToggleContext={() => setShowMobileContext((v) => !v)}
              />
            ) : (
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                description="Choose a mother from the list to view messages and respond."
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

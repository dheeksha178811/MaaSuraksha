import React, { useEffect, useRef } from 'react';
import {
  AssistantMessage as IAssistantMessage,
  AssistantQuickAction,
  UserRole
} from '@/types';
import { AssistantHeader } from './AssistantHeader';
import { AssistantMessage } from './AssistantMessage';
import { AssistantQuickActions } from './AssistantQuickActions';
import { AssistantInput } from './AssistantInput';

export interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  role: UserRole;
  messages: IAssistantMessage[];
  quickActions: AssistantQuickAction[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onSelectQuickAction: (action: AssistantQuickAction) => void;
  onActionClick?: (href: string) => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isOpen,
  onClose,
  onReset,
  role,
  messages,
  quickActions,
  isTyping,
  onSendMessage,
  onSelectQuickAction,
  onActionClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Handle Escape key to close the panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="MaaSuraksha Assistant"
      aria-modal="true"
      className="fixed z-40 inset-x-3 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-22 w-auto sm:w-[410px] max-w-[420px] mx-auto sm:mx-0 h-[530px] max-h-[calc(100vh-100px)] flex flex-col rounded-3xl bg-warm-ivory border border-sandal-200/90 shadow-warm-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 select-text"
    >
      {/* Header */}
      <AssistantHeader
        role={role}
        onClose={onClose}
        onReset={onReset}
      />

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <AssistantMessage
            key={msg.id}
            message={msg}
            onActionClick={onActionClick}
          />
        ))}

        {isTyping && (
          <AssistantMessage
            message={{
              id: 'typing_indicator',
              sender: 'assistant',
              text: '',
              timestamp: '',
              isTyping: true,
            }}
          />
        )}

        {/* Quick action suggestions shown inside chat flow */}
        {!isTyping && (
          <div className="pt-2">
            <AssistantQuickActions
              actions={quickActions}
              onSelectAction={onSelectQuickAction}
              disabled={isTyping}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Query Input */}
      <AssistantInput
        onSend={onSendMessage}
        disabled={isTyping}
        autoFocus={isOpen}
      />
    </div>
  );
};

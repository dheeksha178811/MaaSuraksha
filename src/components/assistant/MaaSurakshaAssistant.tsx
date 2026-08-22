import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMockAuth } from '@/hooks/useMockAuth';
import {
  AssistantMessage as IAssistantMessage,
  AssistantQuickAction,
  AssistantContext
} from '@/types';
import {
  getInitialGreeting,
  getQuickActionsForRole,
  getAssistantResponse
} from '@/services/assistantService';
import { AssistantLauncher } from './AssistantLauncher';
import { AssistantPanel } from './AssistantPanel';

export const MaaSurakshaAssistant: React.FC = () => {
  const { role, user } = useMockAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<IAssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const currentRole = role || 'mother';
  const quickActions = getQuickActionsForRole(currentRole);

  // Initialize or reset conversation whenever role changes
  const resetConversation = useCallback(() => {
    const context: AssistantContext = {
      role: currentRole,
      currentRoute: location.pathname,
      user,
    };
    const initialGreeting = getInitialGreeting(context);
    setMessages([initialGreeting]);
  }, [currentRole, location.pathname, user]);

  useEffect(() => {
    resetConversation();
  }, [currentRole]);

  // Handle sending a message (user text or quick action query)
  const handleSendMessage = async (text: string) => {
    const userMessage: IAssistantMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const context: AssistantContext = {
        role: currentRole,
        currentRoute: location.pathname,
        user,
      };

      const response = await getAssistantResponse(text, context);

      const assistantMessage: IAssistantMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching assistant response:', error);
      const errorMessage: IAssistantMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: "I'm having a slight trouble connecting to my local care guide. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectQuickAction = (action: AssistantQuickAction) => {
    handleSendMessage(action.query);
  };

  const handleActionClick = (_href: string) => {
    // If on very small mobile screens, we can let user browse smoothly
    if (window.innerWidth < 640) {
      // Optional: keep assistant open or let it stay accessible
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <AssistantLauncher
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      {/* Floating Interactive Panel */}
      <AssistantPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onReset={resetConversation}
        role={currentRole}
        messages={messages}
        quickActions={quickActions}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onSelectQuickAction={handleSelectQuickAction}
        onActionClick={handleActionClick}
      />
    </>
  );
};

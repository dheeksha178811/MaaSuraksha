import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User as UserIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AssistantMessage as IAssistantMessage } from '@/types';

export interface AssistantMessageProps {
  message: IAssistantMessage;
  onActionClick?: (href: string) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onActionClick,
}) => {
  const isAssistant = message.sender === 'assistant';

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
        <div className="w-7 h-7 rounded-xl bg-peach-verySoft border border-sandal-200 text-sandal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white border border-sandal-100/90 shadow-subtle flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sandal-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-sandal-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-sandal-400 animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 w-full animate-in fade-in slide-in-from-bottom-1 duration-200',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-7 h-7 rounded-xl bg-peach-verySoft border border-sandal-200 text-sandal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={cn(
          'flex flex-col max-w-[85%] sm:max-w-[80%]',
          isAssistant ? 'items-start' : 'items-end'
        )}
      >
        <div
          className={cn(
            'p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-subtle',
            isAssistant
              ? 'bg-white text-warm-brown rounded-tl-sm border border-sandal-100/90'
              : 'bg-sandal-500 text-white rounded-tr-sm shadow-warm-sm'
          )}
        >
          {/* Formatted Text Content */}
          <div className="whitespace-pre-line break-words space-y-1">
            {message.text}
          </div>

          {/* Embedded Navigation Action Buttons */}
          {isAssistant && message.actions && message.actions.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-sandal-100/80 flex flex-wrap gap-2">
              {message.actions.map((action, idx) => (
                <Link
                  key={`${action.href}-${idx}`}
                  to={action.href}
                  onClick={() => onActionClick && onActionClick(action.href)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 shadow-subtle',
                    action.variant === 'secondary'
                      ? 'bg-warm-cream hover:bg-peach-verySoft text-sandal-900 border border-sandal-200'
                      : 'bg-sandal-500 hover:bg-sandal-600 text-white shadow-warm-sm'
                  )}
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            'text-[10px] px-1 mt-1 font-medium',
            isAssistant ? 'text-warm-muted' : 'text-sandal-700/80'
          )}
        >
          {message.timestamp}
        </span>
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-7 h-7 rounded-xl bg-sandal-200 text-sandal-800 flex items-center justify-center shrink-0 mt-0.5 shadow-subtle">
          <UserIcon className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};

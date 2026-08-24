import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AssistantInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const AssistantInput: React.FC<AssistantInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Ask MaaSuraksha...',
  autoFocus = false,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current && window.innerWidth >= 768) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white/95 border-t border-sandal-200/80 shrink-0"
    >
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Ask MaaSuraksha assistant"
          className={cn(
            'w-full rounded-2xl bg-warm-ivory/80 border border-sandal-200/90 pl-4 pr-12 py-2.5 text-xs sm:text-sm text-warm-brown placeholder:text-stone-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-sandal-500 focus:ring-2 focus:ring-sandal-200 disabled:opacity-60 disabled:cursor-not-allowed',
            disabled && 'bg-warm-cream/50'
          )}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          aria-label="Send message"
          title="Send message"
          className={cn(
            'absolute right-1.5 p-2 rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer',
            input.trim() && !disabled
              ? 'bg-sandal-500 hover:bg-sandal-600 text-white shadow-warm-sm active:scale-95'
              : 'text-stone-300 hover:text-stone-400 disabled:cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

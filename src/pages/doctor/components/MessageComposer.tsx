import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { QUICK_REPLIES } from '@/pages/doctor/doctorMessagingUi';

export interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-sandal-100 pt-3 space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => setText(reply)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-warm-cream border border-sandal-100 text-warm-muted hover:border-sandal-300 hover:text-warm-brown transition-colors"
          >
            {reply.length > 40 ? `${reply.slice(0, 40)}…` : reply}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <IconButton
          aria-label="Attach file"
          variant="outline"
          size="md"
          onClick={() => alert('Attachments are not available in this preview build.')}
        >
          <Paperclip className="w-4 h-4" />
        </IconButton>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message to your patient..."
          disabled={disabled}
          className="flex-1 resize-none px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans disabled:bg-warm-cream/50 disabled:cursor-not-allowed"
        />
        <Button
          size="md"
          leftIcon={<Send className="w-4 h-4" />}
          onClick={handleSend}
          disabled={!text.trim() || disabled}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

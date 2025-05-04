
import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';

export const ChatButton = () => {
  const { isChatOpen, openChat, closeChat } = useChat();
  
  return (
    <Button
      onClick={isChatOpen ? closeChat : openChat}
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
      size="icon"
    >
      {isChatOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <MessageCircle className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isChatOpen ? 'Close chat' : 'Open chat'}
      </span>
    </Button>
  );
};

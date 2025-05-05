
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

const ChatButton = ({ onClick, unreadCount }: ChatButtonProps) => {
  return (
    <Button
      className="rounded-full bg-red-800 hover:bg-red-700 fixed bottom-6 right-6 shadow-lg z-50 h-14 w-14 flex items-center justify-center chat-button-pulse"
      onClick={onClick}
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6" />
        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-amber-300" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </Button>
  );
};

export default ChatButton;

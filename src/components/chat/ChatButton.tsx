
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

const ChatButton = ({ onClick, unreadCount }: ChatButtonProps) => {
  return (
    <Button
      className="rounded-full bg-red-800 hover:bg-red-700 fixed bottom-6 right-6 shadow-lg z-50 h-14 w-14 flex items-center justify-center"
      onClick={onClick}
    >
      <MessageCircle className="h-6 w-6" />
      {unreadCount && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Button>
  );
};

export default ChatButton;

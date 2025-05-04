
import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  isAI?: boolean;
}

const ChatBubble = ({ message, isUser, timestamp, isAI = false }: ChatBubbleProps) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser ? "bg-red-800 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
        )}
      >
        {!isUser && isAI && (
          <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
            <Sparkles size={12} className="text-red-600" />
            <span>AI Response</span>
          </div>
        )}
        <p className="text-sm">{message}</p>
        {timestamp && (
          <p className={cn(
            "text-xs mt-1 text-right",
            isUser ? "text-red-100" : "text-gray-500"
          )}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;

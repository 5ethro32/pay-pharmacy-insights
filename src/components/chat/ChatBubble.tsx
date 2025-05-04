
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isLatest?: boolean;
}

export const ChatBubble = ({ message, isLatest }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full gap-3 py-4",
      isUser ? "flex-row-reverse" : "flex-row",
    )}>
      {/* Avatar */}
      <Avatar className={cn(
        "h-8 w-8 flex items-center justify-center",
        isUser ? "bg-primary" : "bg-muted",
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Avatar>
      
      {/* Message bubble */}
      <div className={cn(
        "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2.5 text-sm",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground",
        isLatest && !isUser && "animate-fade-in"
      )}>
        {formatMessage(message.content)}
      </div>
    </div>
  );
};

// Helper function to format messages with markdown-like syntax
function formatMessage(content: string) {
  // Split content by newlines to handle paragraphs
  return content.split('\n').map((text, index) => {
    if (!text.trim()) return <br key={index} />;
    return <p key={index} className="mb-1 last:mb-0">{text}</p>;
  });
}

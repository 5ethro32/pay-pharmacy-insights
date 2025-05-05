
import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  isAI?: boolean;
  chartData?: any[];
  chartType?: 'bar' | 'line' | 'pie';
}

const ChatBubble = ({ message, isUser, timestamp, isAI = false, chartData, chartType }: ChatBubbleProps) => {
  // Format message to handle markdown-style bold formatting
  const formatMessage = (text: string) => {
    // Replace **text** with <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-bubble-animation`}>
      <div 
        className={`relative max-w-[85%] px-4 py-3 rounded-lg shadow-sm ${
          isUser 
            ? 'bg-red-800 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <div 
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />
        
        <div className="mt-1 text-xs opacity-70 flex items-center justify-between">
          <span>{timestamp}</span>
          {isAI && (
            <span className="ml-2 flex items-center gap-1 bg-gradient-to-r from-red-700 to-red-900 text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;

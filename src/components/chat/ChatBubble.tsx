
import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

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
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format high-value items lists - match patterns like "1. DRUG NAME - £1,234.56 (Quantity: 123)"
    const formattedWithItems = boldFormatted.replace(
      /(\d+)\.\s+([A-Z0-9\s\/]+)\s+-\s+(£[\d,\.]+)\s+\(Quantity:\s+(\d+)\)/g,
      '<div class="high-value-item"><span class="item-number">$1.</span> <span class="item-name">$2</span> <div class="item-details"><span class="item-price">$3</span> <span class="item-quantity">(Quantity: $4)</span></div></div>'
    );
    
    return formattedWithItems;
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
            <span className="ml-2 flex items-center gap-1 bg-gradient-to-r from-red-700 to-red-900 text-white px-2 py-0.5 rounded-full text-[10px] font-medium assistant-badge">
              <Sparkles className="h-2.5 w-2.5" />
              Assistant
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;

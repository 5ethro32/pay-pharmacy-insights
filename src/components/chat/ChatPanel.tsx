
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, X, MessageCircle, Sparkles, ChartBar } from 'lucide-react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types/chatTypes';

interface ChatPanelProps {
  messages: Message[];
  onClose: () => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  suggestedQuestions?: string[];
  onSuggestedQuestionClick?: (question: string) => void;
  isMobileSized?: boolean;
  expanded?: boolean;
  onExpand?: (expanded: boolean) => void;
}

const ChatPanel = ({
  messages,
  onClose,
  onSendMessage,
  isLoading = false,
  suggestedQuestions = [],
  onSuggestedQuestionClick,
  isMobileSized = false,
  expanded = false,
  onExpand
}: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedQuestionsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpand = () => {
    if (onExpand) {
      onExpand(!expanded);
    }
  };

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestedQuestionsRef.current) {
      const scrollAmount = 200; // Adjust scroll amount as needed
      if (direction === 'left') {
        suggestedQuestionsRef.current.scrollLeft -= scrollAmount;
      } else {
        suggestedQuestionsRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <div 
      className={`flex flex-col bg-white border ${
        isMobileSized 
          ? "rounded-lg h-[500px] w-full shadow-lg" 
          : `h-full w-full shadow-none border-l ${expanded ? "w-[480px]" : "w-[400px]"}`
      }`}
    >
      {/* Improved header with more modern styling */}
      <div className="bg-red-800 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <Sparkles className="h-2.5 w-2.5 absolute -top-1 -right-1 text-amber-300" />
          </div>
          <h3 className="font-medium">Scriptly Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          {!isMobileSized && (
            <Button variant="ghost" size="icon" onClick={toggleExpand} className="text-white hover:bg-red-700">
              {expanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-red-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Improved empty state with better styling */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-60 text-center p-6">
              <div className="bg-red-50 rounded-full p-3 mb-4">
                <Sparkles className="h-6 w-6 text-red-800" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">How can I assist you?</h3>
              <p className="text-gray-500 mb-4">I can help you analyse your pharmacy data, compare metrics, and provide insights.</p>
              
              <div className="w-full">
                <div className="flex flex-wrap gap-1 justify-center">
                  <div className="bg-gray-100 w-1 h-1 rounded-full mx-0.5"></div>
                  <div className="bg-gray-200 w-1 h-1 rounded-full mx-0.5"></div>
                  <div className="bg-gray-300 w-1 h-1 rounded-full mx-0.5"></div>
                  <div className="bg-gray-200 w-1 h-1 rounded-full mx-0.5"></div>
                  <div className="bg-gray-100 w-1 h-1 rounded-full mx-0.5"></div>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={msg.content} 
              isUser={msg.isUser} 
              timestamp={formatTimestamp(msg.timestamp)} 
              isAI={!msg.isUser && msg.isAI}
              chartData={msg.chartData}
              chartType={msg.chartType}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg p-3 rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '600ms'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Horizontal scrollable suggested questions with AI icons */}
      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
          <div className="relative">
            <div 
              ref={suggestedQuestionsRef}
              className="flex overflow-x-auto hide-scrollbar pb-1 gap-2 suggested-questions-container"
            >
              {suggestedQuestions.map((question, index) => {
                // Use different gradient styles for visual variety
                const gradientClass = [
                  "from-red-50 to-red-100 text-red-800",
                  "from-amber-50 to-amber-100 text-amber-800",
                  "from-rose-50 to-rose-100 text-rose-800",
                  "from-orange-50 to-orange-100 text-orange-800",
                  "from-pink-50 to-pink-100 text-pink-800",
                ][index % 5];
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`text-xs py-1 px-3 h-auto bg-gradient-to-r ${gradientClass} border-transparent suggested-question whitespace-nowrap flex items-center gap-1`}
                    onClick={() => onSuggestedQuestionClick && onSuggestedQuestionClick(question)}
                  >
                    <ChartBar className="h-3 w-3 shrink-0" />
                    {question}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Improved chat input */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatPanel;

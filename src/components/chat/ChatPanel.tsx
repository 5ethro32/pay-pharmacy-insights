
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, X } from 'lucide-react';
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
}

const ChatPanel = ({
  messages,
  onClose,
  onSendMessage,
  isLoading = false,
  suggestedQuestions = [],
  onSuggestedQuestionClick,
  isMobileSized = false
}: ChatPanelProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState(false);

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
    setExpanded(!expanded);
  };

  return (
    <div 
      className={`flex flex-col bg-white border ${
        isMobileSized 
          ? "rounded-lg h-[500px] w-full shadow-lg" 
          : `h-full w-full shadow-none border-l ${expanded ? "w-[600px]" : "w-[400px]"}`
      }`}
    >
      <div className="bg-red-800 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium">Scriptly Assistant</h3>
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

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-gray-500 mb-4">How can I help you with your pharmacy data?</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={msg.content} 
              isUser={msg.isUser} 
              timestamp={formatTimestamp(msg.timestamp)} 
              isAI={!msg.isUser && msg.isAI}
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
      
      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs py-1 px-2 h-auto"
                onClick={() => onSuggestedQuestionClick && onSuggestedQuestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatPanel;

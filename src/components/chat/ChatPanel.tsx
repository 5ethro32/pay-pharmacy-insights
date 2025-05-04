
import React, { useEffect, useRef } from 'react';
import { X, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { useChatContext } from '@/hooks/use-chat-context';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatPanelProps {
  documents?: any[];
  selectedMetric?: any;
}

export const ChatPanel = ({ documents = [], selectedMetric }: ChatPanelProps) => {
  const { messages, isLoading, sendMessage, clearConversation, closeChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pageContext = useChatContext(documents, selectedMetric);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    sendMessage(content, pageContext);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background rounded-tl-lg border border-b-0 shadow-lg">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <h3 className="font-medium">Scriptly Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearConversation}
            title="Clear conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeChat}
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-8">
              <h3 className="text-lg font-medium">Welcome to Scriptly Assistant</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                I can help you analyze your pharmacy payment data and answer questions about your metrics.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => handleSendMessage("Can you explain what Gross Ingredient Cost means?")}
                  className="text-xs justify-start"
                >
                  What is Gross Ingredient Cost?
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSendMessage("How is my payment trend looking?")}
                  className="text-xs justify-start"
                >
                  Analyze my payment trend
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatBubble 
                key={message.id} 
                message={message}
                isLatest={index === messages.length - 1} 
              />
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 py-4">
              <div className="h-8 w-8">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="space-y-2 max-w-[80%]">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
      />
    </div>
  );
};

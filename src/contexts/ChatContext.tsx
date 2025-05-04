
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string, context?: string) => Promise<void>;
  clearConversation: () => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sendMessage = useCallback(async (content: string, context?: string) => {
    if (!content.trim()) return;

    try {
      setIsLoading(true);
      
      // Add user message to the conversation
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Format conversation history for the API
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .slice(-10) // Keep only last 10 messages for context
        .map(m => ({
          role: m.role,
          content: m.content,
        }));
      
      // Send request to our edge function
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          query: content, 
          context, 
          conversationHistory: [...conversationHistory, { role: 'user', content }] 
        },
      });
      
      if (error) throw error;
      
      // Add assistant response to conversation
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);
  
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);
  
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading, 
      sendMessage, 
      clearConversation, 
      isChatOpen, 
      openChat, 
      closeChat 
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

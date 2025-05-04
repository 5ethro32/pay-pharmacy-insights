
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message } from '@/types/chatTypes';
import { toast } from '@/hooks/use-toast';

interface ChatContextProps {
  children: ReactNode;
}

interface ChatContextState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  suggestedQuestions: string[];
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
  useSuggestedQuestion: (question: string) => void;
}

const initialSuggestedQuestions = [
  "How does my net payment compare to last month?",
  "What are my highest value items?",
  "How is my Pharmacy First performance?",
  "What's my payment date for next month?",
];

const ChatContext = createContext<ChatContextState | undefined>(undefined);

export const ChatProvider = ({ children }: ChatContextProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(initialSuggestedQuestions);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // TODO: Replace with actual API call to the Supabase Edge Function
  const mockResponse = useCallback((message: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple response logic - in real app, this would call the edge function
        if (message.toLowerCase().includes('payment')) {
          resolve("Based on your payment data, your net payment has increased by 3.2% compared to last month. Your total payment was £24,532.");
        } else if (message.toLowerCase().includes('pharmacy first') || message.toLowerCase().includes('pfs')) {
          resolve("Your Pharmacy First performance is strong with 142 consultations this month, which is 15% higher than the average in your health board.");
        } else if (message.toLowerCase().includes('item')) {
          resolve("Your highest value items this month were Apixaban 5mg tablets, Rivaroxaban 20mg tablets, and Edoxaban 60mg tablets.");
        } else {
          resolve("I'm analyzing your pharmacy data to answer that question. Your most recent payment schedule shows a positive trend in dispensing fees. Can I provide more specific information?");
        }
      }, 1500);
    });
  }, []);

  const generateNewSuggestions = useCallback((userMessage: string) => {
    // This would ideally be powered by AI to generate contextual suggestions
    // For now, we'll use some simple logic
    if (userMessage.toLowerCase().includes('payment')) {
      return [
        "When is my next payment due?",
        "How has my payment changed over 6 months?",
        "What affects my payment the most?",
      ];
    } else if (userMessage.toLowerCase().includes('pharmacy first')) {
      return [
        "How many PFS consultations did I do?",
        "What's the average PFS payment per consultation?",
        "How does my PFS compare to others?",
      ];
    } else {
      return [
        "Explain my dispensing fee calculation",
        "What are my highest value items?",
        "How can I improve my pharmacy performance?",
        "Show me my payment breakdown",
      ];
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await mockResponse(content);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Generate new suggested questions based on the conversation
      const newSuggestions = generateNewSuggestions(content);
      setSuggestedQuestions(newSuggestions);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [mockResponse, generateNewSuggestions]);

  const useSuggestedQuestion = useCallback((question: string) => {
    sendMessage(question);
  }, [sendMessage]);

  const value = {
    isOpen,
    messages,
    isLoading,
    suggestedQuestions,
    openChat,
    closeChat,
    sendMessage,
    useSuggestedQuestion
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message } from '@/types/chatTypes';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDocuments } from '@/hooks/use-documents';

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
  
  // Get documents data to provide context to the AI
  const { documents, loading } = useDocuments();

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
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
      // Get current path to provide context to the assistant
      const currentPath = window.location.pathname;
      
      // Extract relevant data to provide as context
      let dataContext = {};
      
      if (documents && documents.length > 0) {
        console.log('Preparing data context from documents:', documents);
        
        // Extract high-value items if available
        const highValueItems = documents
          .flatMap(doc => {
            // Check nested locations for high value items
            const items = doc.highValueItems || doc.extracted_data?.highValueItems || [];
            console.log(`Found ${items.length} high value items in document ${doc.id}`);
            return items;
          })
          .sort((a, b) => (b.paidGicInclBb || 0) - (a.paidGicInclBb || 0))
          .slice(0, 5);
          
        // Extract summary data from the most recent document
        // Sort by id as we don't have uploaded_at in PaymentData type
        const latestDocument = documents.sort((a, b) => 
          // Using string comparison as a fallback since we don't have uploaded_at
          b.id.localeCompare(a.id)
        )[0];
        
        // Get previous month's document for comparison
        let previousMonthDocument = null;
        if (documents.length > 1) {
          const months = [
            "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
          ];
          
          const currentMonthIndex = months.indexOf(latestDocument.month.toUpperCase());
          const prevMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : 11;
          const prevMonthYear = currentMonthIndex > 0 ? latestDocument.year : latestDocument.year - 1;
          const prevMonth = months[prevMonthIndex];
          
          previousMonthDocument = documents.find(doc => 
            doc.month.toUpperCase() === prevMonth && doc.year === prevMonthYear
          );
          
          console.log(`Latest document: ${latestDocument.month} ${latestDocument.year}`);
          console.log(`Previous month document: ${previousMonthDocument ? 
            `${previousMonthDocument.month} ${previousMonthDocument.year}` : 'Not found'}`);
        }
        
        dataContext = {
          highValueItems: highValueItems.length > 0 ? highValueItems : null,
          netPayment: latestDocument.netPayment || latestDocument.extracted_data?.netPayment || null,
          previousMonthNetPayment: previousMonthDocument?.netPayment || null,
          contractorCode: latestDocument.contractorCode || latestDocument.extracted_data?.contractorCode || null,
          totalItems: latestDocument.totalItems || latestDocument.extracted_data?.itemCounts?.total || null,
          month: latestDocument.month || latestDocument.extracted_data?.month || null,
          year: latestDocument.year || latestDocument.extracted_data?.year || null,
          pharmacyFirstBase: latestDocument.financials?.pharmacyFirstBase || 
                            latestDocument.extracted_data?.financials?.pharmacyFirstBase || null,
          pharmacyFirstActivity: latestDocument.financials?.pharmacyFirstActivity || 
                                latestDocument.extracted_data?.financials?.pharmacyFirstActivity || null,
          pfsDetails: latestDocument.pfsDetails || latestDocument.extracted_data?.pfsDetails || null,
        };
        
        console.log('Data context prepared for edge function:', dataContext);
      } else {
        console.log('No documents available for data context');
      }
      
      // Call the Supabase Edge Function
      console.log('Sending message to edge function with data context');
      const { data, error } = await supabase.functions.invoke('scriptly-assistant', {
        body: { 
          message: content,
          currentView: currentPath,
          dataContext // Pass data context to the edge function
        }
      });
      
      if (error) throw new Error(error.message);
      
      console.log('Edge function response:', data);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.response,
        isUser: false,
        isAI: true, // Mark this as an AI response
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      
      // Update suggested questions based on the response
      if (data.suggestedQuestions && Array.isArray(data.suggestedQuestions)) {
        setSuggestedQuestions(data.suggestedQuestions);
      }
      
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

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

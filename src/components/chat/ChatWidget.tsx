
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatButton } from './ChatButton';
import { ChatPanel } from './ChatPanel';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatWidgetProps {
  documents?: any[];
  selectedMetric?: any;
}

export const ChatWidget = ({ documents, selectedMetric }: ChatWidgetProps) => {
  const { isChatOpen } = useChat();
  
  return (
    <>
      <ChatButton />
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:bottom-4 sm:right-20 w-[90vw] sm:w-[450px] h-[600px] max-h-[80vh] z-50"
          >
            <ChatPanel documents={documents} selectedMetric={selectedMetric} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

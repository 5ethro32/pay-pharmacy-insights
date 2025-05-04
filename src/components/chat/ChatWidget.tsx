
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';
import { useChatContext } from '@/contexts/ChatContext';

const ChatWidget = () => {
  const {
    isOpen,
    openChat,
    closeChat,
    messages,
    sendMessage,
    isLoading,
    suggestedQuestions,
    useSuggestedQuestion
  } = useChatContext();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <ChatPanel
              messages={messages}
              onClose={closeChat}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              suggestedQuestions={suggestedQuestions}
              onSuggestedQuestionClick={useSuggestedQuestion}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChatButton onClick={openChat} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;


import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';

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
  
  const isMobile = useIsMobile();
  const { setOpen } = useSidebar();
  
  // When chat opens on desktop, close the sidebar
  React.useEffect(() => {
    if (!isMobile && isOpen) {
      setOpen(false);
    }
  }, [isOpen, isMobile, setOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="chatPanel"
            initial={isMobile ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 0, x: 300 }}
            animate={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, x: 0 }}
            exit={isMobile ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 0, x: 300 }}
            transition={{ duration: 0.2 }}
            className={isMobile 
              ? "fixed bottom-0 right-0 z-50 p-4 w-full max-w-[100vw]" 
              : "fixed top-0 right-0 z-50 h-screen w-[400px] shadow-xl"
            }
          >
            <ChatPanel
              messages={messages}
              onClose={closeChat}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              suggestedQuestions={suggestedQuestions}
              onSuggestedQuestionClick={useSuggestedQuestion}
              isMobileSized={isMobile}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chatButton"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <ChatButton onClick={openChat} unreadCount={0} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

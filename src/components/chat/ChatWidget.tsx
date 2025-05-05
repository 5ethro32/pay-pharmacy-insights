
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import './chat.css';

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
  const { setOpen, setOpenMobile, state } = useSidebar();
  const [expanded, setExpanded] = React.useState(false);
  const { user } = useAuth();
  
  // When chat opens on desktop, ensure sidebar is closed
  useEffect(() => {
    if (!isMobile && isOpen) {
      // Force close the sidebar when chat opens
      setOpen(false);
      document.body.classList.add('chat-open');
      
      if (expanded) {
        document.body.classList.add('chat-expanded');
      } else {
        document.body.classList.remove('chat-expanded');
      }
    } else {
      document.body.classList.remove('chat-open', 'chat-expanded');
    }
    
    return () => {
      document.body.classList.remove('chat-open', 'chat-expanded');
    };
  }, [isOpen, isMobile, setOpen, expanded]);

  // Handle expanded state changes
  useEffect(() => {
    if (expanded && isOpen && !isMobile) {
      document.body.classList.add('chat-expanded');
    } else {
      document.body.classList.remove('chat-expanded');
    }
  }, [expanded, isOpen, isMobile]);

  const handleExpand = (state: boolean) => {
    setExpanded(state);
  };

  // If user is not authenticated, don't render the chat widget
  if (!user) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <>
            {isMobile ? (
              // Mobile view - full screen overlay
              <motion.div
                key="chatPanel-mobile"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 p-4 bg-white/95 backdrop-blur-sm"
              >
                <ChatPanel
                  messages={messages}
                  onClose={closeChat}
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  suggestedQuestions={suggestedQuestions}
                  onSuggestedQuestionClick={useSuggestedQuestion}
                  isMobileSized={true}
                />
              </motion.div>
            ) : (
              // Desktop view - resizable side panel
              <motion.div
                key="chatPanel-desktop"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 right-0 z-50 h-screen shadow-xl flex"
              >
                <div className={`h-full w-full ${expanded ? 'chat-expanded' : ''}`} style={{ width: expanded ? '480px' : '400px' }}>
                  <ChatPanel
                    messages={messages}
                    onClose={closeChat}
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    suggestedQuestions={suggestedQuestions}
                    onSuggestedQuestionClick={useSuggestedQuestion}
                    isMobileSized={false}
                    expanded={expanded}
                    onExpand={handleExpand}
                  />
                </div>
              </motion.div>
            )}
          </>
        ) : (
          // Chat button when chat is closed
          <motion.div
            key="chatButton"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <ChatButton onClick={openChat} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

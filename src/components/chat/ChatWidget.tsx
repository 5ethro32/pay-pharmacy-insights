import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';
import { useChatContext } from '@/contexts/ChatContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';

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
  useEffect(() => {
    if (!isMobile && isOpen) {
      setOpen(false);
    }
  }, [isOpen, isMobile, setOpen]);

  // For desktop: when chat opens, add a class to the main content to make it responsive
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent && !isMobile) {
      if (isOpen) {
        mainContent.classList.add('chat-open');
        document.body.style.overflow = 'hidden';
      } else {
        mainContent.classList.remove('chat-open');
        document.body.style.overflow = '';
      }
    }
    
    // Mobile specific handling
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else if (isMobile && !isOpen) {
      document.body.style.overflow = '';
    }
    
    return () => {
      if (mainContent) {
        mainContent.classList.remove('chat-open');
      }
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <>
            {isMobile ? (
              // Mobile view - full screen overlay (keep existing implementation)
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
              // Desktop view - integrated resizable panel
              <motion.div
                key="chatPanel-desktop"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 right-0 z-50 h-screen shadow-xl flex"
                style={{ width: 'auto' }}
              >
                <ResizablePanelGroup direction="horizontal">
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                    <div className="h-full w-full min-w-[350px] max-w-[600px]">
                      <ChatPanel
                        messages={messages}
                        onClose={closeChat}
                        onSendMessage={sendMessage}
                        isLoading={isLoading}
                        suggestedQuestions={suggestedQuestions}
                        onSuggestedQuestionClick={useSuggestedQuestion}
                        isMobileSized={false}
                      />
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
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
            <ChatButton onClick={openChat} unreadCount={0} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;

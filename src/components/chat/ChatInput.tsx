
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaperPlane } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 chat-input-container">
      <div className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your pharmacy data..."
          className="w-full px-4 py-2.5 pr-12 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-red-800 focus:border-red-800 chat-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!message.trim() || isLoading}
          className={`chat-send-button flex items-center justify-center ${!message.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Send message"
        >
          <PaperPlane className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

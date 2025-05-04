
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

export interface ChatContextState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  suggestedQuestions: string[];
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
  useSuggestedQuestion: (question: string) => void;
}

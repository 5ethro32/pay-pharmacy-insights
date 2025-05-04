
export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  isAI?: boolean;
}

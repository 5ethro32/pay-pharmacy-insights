export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  isAI?: boolean;
  chartData?: any[];
  chartType?: 'bar' | 'line' | 'pie';
}

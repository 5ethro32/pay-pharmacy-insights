
import React from 'react';
import { Sparkles, MessageCircle, ChartBar, ChartLine, ChartPie } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  isAI?: boolean;
  chartData?: any[];
  chartType?: 'bar' | 'line' | 'pie';
}

const COLORS = ['#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171'];

const ChatBubble = ({ message, isUser, timestamp, isAI = false, chartData, chartType }: ChatBubbleProps) => {
  // Format message to handle various formatting patterns
  const formatMessage = (text: string) => {
    // Replace **text** with <strong>text</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format high-value items lists - match patterns like "1. DRUG NAME - £1,234.56 (Quantity: 123)"
    formattedText = formattedText.replace(
      /(\d+)\.\s+([A-Z0-9\s\/]+)\s+-\s+(£[\d,\.]+)\s+\(Quantity:\s+(\d+)\)/g,
      '<div class="list-item"><span class="item-number">$1.</span> <span class="item-name">$2</span> <div class="item-details"><span class="item-price">$3</span> <span class="item-quantity">(Quantity: $4)</span></div></div>'
    );
    
    // Improved general numbered lists - match patterns like "1. Some text" that weren't caught by the more specific pattern
    formattedText = formattedText.replace(
      /(\d+)\.\s+((?:(?!\d+\.).)+?)(?=\s+\d+\.|$)/g,
      '<div class="list-item"><span class="item-number">$1.</span> <span class="item-content">$2</span></div>'
    );

    // Add spacing between paragraphs
    formattedText = formattedText.replace(/\n\n/g, '<div class="paragraph-break"></div>');

    return formattedText;
  };

  // Render chart based on type and data
  const renderChart = (type: string = 'bar', data: any[] = []) => {
    if (!data || data.length === 0) return null;
    
    switch(type) {
      case 'bar':
        return (
          <div className="chat-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                />
                <Bar dataKey="value" fill="#991b1b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'line':
        return (
          <div className="chat-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#991b1b" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#991b1b', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#991b1b', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'pie':
        return (
          <div className="chat-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={30}
                  fill="#991b1b"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Value']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderColor: '#e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 chat-bubble-animation`}>
      <div 
        className={`relative max-w-[85%] px-4 py-3 rounded-lg shadow-sm ${
          isUser 
            ? 'bg-red-800 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        {chartData && chartType && renderChart(chartType, chartData)}
        
        <div 
          className="text-sm chat-message-content"
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />
        
        <div className="mt-1 text-xs opacity-70 flex items-center justify-between">
          <span>{timestamp}</span>
          {isAI && (
            <span className="ml-2 flex items-center gap-1 bg-gradient-to-r from-red-700 to-red-900 text-white px-2 py-0.5 rounded-full text-[10px] font-medium assistant-badge">
              <Sparkles className="h-2.5 w-2.5" />
              Assistant
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;

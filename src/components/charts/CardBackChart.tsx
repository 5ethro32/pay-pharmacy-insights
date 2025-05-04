
import React, { useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from "recharts";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import { transformPaymentDataToChartData, sortChartDataChronologically } from "@/utils/chartDataTransformer";
import { getMonthIndex } from "@/utils/chartUtils";

interface CardBackChartProps {
  documents: PaymentData[];
  metric: MetricKey;
}

const CardBackChart: React.FC<CardBackChartProps> = ({ documents, metric }) => {
  // Transform documents for chart display
  const chartData = useMemo(() => {
    // Create proper Date objects for each document
    const documentsWithDates = documents.map(doc => ({
      ...doc,
      dateObj: new Date(doc.year, getMonthIndex(doc.month), 1)
    }));
    
    // Transform the data for the chart
    const transformedData = transformPaymentDataToChartData(documentsWithDates, metric);
    
    // Sort chronologically and limit to 6 most recent entries
    const sortedData = sortChartDataChronologically(transformedData);
    return sortedData.slice(-6);
  }, [documents, metric]);

  // Get color from METRICS for the line color
  const lineColor = METRICS[metric]?.color || "#f43f5e";
  
  // Format function based on metric type
  const formatValue = (value: any) => {
    if (METRICS[metric] && typeof METRICS[metric].format === 'function') {
      return METRICS[metric].format(value);
    }
    return value;
  };
  
  return (
    <div className="w-full h-full px-1 pt-1">
      <ResponsiveContainer width="100%" height="80%">
        <LineChart 
          data={chartData}
          margin={{ top: 10, right: 15, left: 15, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 9 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatValue}
            tick={{ fontSize: 9 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            width={50}
          />
          <Tooltip 
            formatter={(value: any) => [formatValue(value), METRICS[metric].label]}
            labelFormatter={(label) => `${label}`}
            cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
          />
          <Line 
            type="monotone"
            dataKey="value" 
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 1, fill: "white", stroke: lineColor }}
            activeDot={{ r: 4, strokeWidth: 0, fill: lineColor }}
            name={METRICS[metric].label}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CardBackChart;


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
import { calculateDomain } from "@/utils/chartUtils";

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

  // Get all values to calculate appropriate domain
  const allValues = chartData.map(item => item.value);
  const yAxisDomain = calculateDomain(allValues);
  
  // Custom tick formatter for x-axis to remove the day number and capitalize only first letter
  const formatXAxisTick = (tickItem: string) => {
    if (!tickItem) return '';
    return tickItem;
  };

  // Custom tooltip formatter for cleaner labels
  const customTooltipFormatter = (value: any) => {
    const formattedValue = formatValue(value);
    return [formattedValue, METRICS[metric].label];
  };
  
  // Custom label formatter to show only the month name properly formatted
  const customLabelFormatter = (label: string) => {
    if (!label) return '';
    return label;
  };
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 9 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            tickFormatter={formatXAxisTick}
          />
          <YAxis 
            tickFormatter={formatValue}
            tick={{ fontSize: 9 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            width={50}
            domain={yAxisDomain}
          />
          <Tooltip 
            formatter={customTooltipFormatter}
            labelFormatter={customLabelFormatter}
            cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
            contentStyle={{ fontSize: '10px', padding: '4px 6px' }}
            itemStyle={{ padding: '1px 0' }}
          />
          <Line 
            type="monotone"
            dataKey="value" 
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 1, fill: "white", stroke: lineColor }}
            activeDot={{ r: 3, strokeWidth: 0, fill: lineColor }}
            name={METRICS[metric].label}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CardBackChart;


import React, { useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Label,
  CartesianGrid
} from "recharts";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import { transformPaymentDataToChartData } from "@/utils/chartDataTransformer";
import { getMonthIndex, calculateDomain } from "@/utils/chartUtils";

interface MetricCardChartProps {
  documents: PaymentData[];
  metric: MetricKey;
}

const MetricCardChart: React.FC<MetricCardChartProps> = ({ 
  documents, 
  metric
}) => {
  // Create proper Date objects for each document
  const documentsWithDates = useMemo(() => documents.map(doc => ({
    ...doc,
    dateObj: new Date(doc.year, getMonthIndex(doc.month), 1)
  })), [documents]);
  
  // Transform and sort the data for the chart
  const chartData = useMemo(() => {
    // Get data
    const transformedData = transformPaymentDataToChartData(documentsWithDates, metric);
    
    // Sort by date (chronologically)
    const sortedData = [...transformedData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // Limit to most recent months if there are many
    return sortedData.length > 6 ? sortedData.slice(-6) : sortedData;
  }, [documentsWithDates, metric]);

  // Calculate average value for trend line
  const averageValue = useMemo(() => {
    const validValues = chartData.map(item => item.value).filter(v => v !== undefined);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }, [chartData]);

  // Safe formatter function
  const safeFormat = (value: any) => {
    if (METRICS[metric] && typeof METRICS[metric].format === 'function') {
      // If it's a currency metric, use compact notation
      if (metric === "netPayment" || 
          metric === "grossIngredientCost" || 
          metric === "supplementaryPayments" || 
          metric === "averageValuePerItem") {
        
        // Format with k for thousands, M for millions
        if (value >= 1000000) {
          return `£${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `£${(value / 1000).toFixed(0)}k`;
        } else {
          return `£${Math.round(value)}`;
        }
      }
      
      // For non-currency metrics, use the default formatter
      return METRICS[metric].format(value);
    }
    return value;
  };

  // Calculate optimized domain for Y-axis
  const yAxisDomain = useMemo(() => {
    const values = chartData.map(item => item.value);
    return calculateDomain(values);
  }, [chartData]);

  // Get color from METRICS for the line color
  const lineColor = METRICS[metric]?.color || "#f43f5e";

  return (
    <div className="h-full w-full p-2">
      <h3 className="text-sm font-medium text-center mb-2">{METRICS[metric]?.label} Trend</h3>
      <div className="h-[calc(100%-30px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 9 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              angle={-30}
              height={30}
            />
            <YAxis 
              tickFormatter={safeFormat}
              tick={{ fontSize: 9 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              width={40}
              domain={yAxisDomain}
            />
            <Tooltip 
              formatter={(value: any) => [safeFormat(value), METRICS[metric].label]}
              labelFormatter={(label) => `${label}`}
              cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
            />
            <ReferenceLine 
              y={averageValue} 
              stroke="#777777" 
              strokeDasharray="3 3" 
              strokeWidth={1}
            />
            <Line 
              type="monotone"
              dataKey="value" 
              stroke={lineColor}
              strokeWidth={3}
              dot={{ r: 2, strokeWidth: 2, fill: "white", stroke: lineColor }}
              activeDot={{ r: 4, strokeWidth: 0, fill: lineColor }}
              name={METRICS[metric].label}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricCardChart;

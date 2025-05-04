
import React, { useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Label
} from "recharts";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import { transformPaymentDataToChartData } from "@/utils/chartDataTransformer";
import { getMonthIndex, calculateDomain } from "@/utils/chartUtils";

interface MobileMetricChartProps {
  documents: PaymentData[];
  metric: MetricKey;
}

const MobileMetricChart: React.FC<MobileMetricChartProps> = ({ 
  documents, 
  metric
}) => {
  // Create proper Date objects for each document to ensure accurate sorting
  const documentsWithDates = useMemo(() => documents.map(doc => ({
    ...doc,
    dateObj: new Date(doc.year, getMonthIndex(doc.month), 1)
  })), [documents]);
  
  // Transform and sort the data for the chart
  const chartData = useMemo(() => {
    // Get data
    const transformedData = transformPaymentDataToChartData(documentsWithDates, metric);
    
    // Sort by date (chronologically - oldest to newest)
    const sortedData = [...transformedData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // Limit to 6 most recent months
    return sortedData.slice(-6);
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
      // If it's a currency metric, use compact notation (k, M)
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

  // Format average value for the reference line in compact form
  const formattedAverageValue = useMemo(() => {
    if (metric === "netPayment" || 
        metric === "grossIngredientCost" || 
        metric === "supplementaryPayments" || 
        metric === "averageValuePerItem") {
      
      // Format with k for thousands, M for millions
      if (averageValue >= 1000000) {
        return `£${(averageValue / 1000000).toFixed(1)}M`;
      } else if (averageValue >= 1000) {
        return `£${(averageValue / 1000).toFixed(0)}k`;
      } else {
        return `£${Math.round(averageValue)}`;
      }
    }
    return METRICS[metric].format(averageValue);
  }, [averageValue, metric]);

  // Calculate optimized domain for Y-axis
  const yAxisDomain = useMemo(() => {
    // Get all values
    const values = chartData.map(item => item.value);
    
    // Calculate min and max of the dataset
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate the range
    const range = max - min;
    
    // If range is small relative to the values (flat line), create a more focused view
    // This ensures small changes are visible when values are large
    if (range < max * 0.1) {
      // Use 20% padding below the minimum and 20% above the maximum
      const padding = range * 1.0;
      // Never go below zero for financial metrics
      const lowerBound = Math.max(0, min - padding);
      return [lowerBound, max + padding];
    }
    
    // Otherwise use regular domain calculation with more standard padding
    return calculateDomain(values);
  }, [chartData]);
  
  // Format the month names to just 3-letter abbreviations as shown in the image
  const formatXAxisTick = (value: string) => {
    // Convert month names to 3-letter abbreviations (e.g., "January" to "Jan")
    if (!value) return '';
    
    // If it's already a 3-letter abbreviation, return as is
    if (value.length <= 3) return value;
    
    // Otherwise, take first 3 letters
    return value.substring(0, 3);
  };

  // Get color from METRICS for the line color
  const lineColor = METRICS[metric]?.color || "#f43f5e";

  return (
    <div style={{ width: '100%', height: '140px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            interval={0}
            tickFormatter={formatXAxisTick}
            height={25}
          />
          <YAxis 
            tickFormatter={safeFormat}
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            width={45}
            domain={yAxisDomain}
          />
          <Tooltip 
            formatter={(value: any) => [safeFormat(value), METRICS[metric].label]}
            labelFormatter={(label) => {
              // Show full month name in tooltip
              return label;
            }}
            cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
          />
          <ReferenceLine 
            y={averageValue} 
            stroke="#777777" 
            strokeDasharray="3 3" 
            strokeWidth={1}
          >
            <Label 
              value={`Avg: ${formattedAverageValue}`}
              position="insideBottomRight" 
              fill="#666" 
              fontSize={10}
            />
          </ReferenceLine>
          <Line 
            type="monotone"
            dataKey="value" 
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2, fill: "white", stroke: lineColor }}
            activeDot={{ r: 5, strokeWidth: 0, fill: lineColor }}
            name={METRICS[metric].label}
            connectNulls={true}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MobileMetricChart;

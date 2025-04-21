import React, { useState, useMemo, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine, 
  Label,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PaymentData } from "@/types/paymentTypes";
import { METRICS, MetricKey } from "@/constants/chartMetrics";
import { getMonthIndex, calculateDomain } from "@/utils/chartUtils";
import { 
  transformPaymentDataToChartData,
} from "@/utils/chartDataTransformer";
import ChartTooltip from "@/components/charts/ChartTooltip";
import TrendIndicator from "@/components/charts/TrendIndicator";
import MetricSelector from "@/components/charts/MetricSelector";
import { useIsMobile } from "@/hooks/use-mobile";

// Add the extended interface here as well for type safety
interface PaymentDataWithDate extends PaymentData {
  dateObj?: Date;
}

interface LineChartMetricsProps {
  documents: PaymentData[];
  selectedMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
}

const LineChartMetrics: React.FC<LineChartMetricsProps> = ({ 
  documents, 
  selectedMetric, 
  onMetricChange 
}) => {
  const isMobile = useIsMobile();
  
  if (!documents?.length) {
    return null;
  }
  
  // Create proper Date objects for each document to ensure accurate sorting
  const documentsWithDates = documents.map(doc => ({
    ...doc,
    dateObj: new Date(doc.year, getMonthIndex(doc.month), 1)
  })) as PaymentDataWithDate[];
  
  // Transform the data for the chart
  const chartData = useMemo(() => {
    // Transform the data
    const transformedData = transformPaymentDataToChartData(documentsWithDates, selectedMetric);
    
    // Sort chronologically by actual date (oldest to newest)
    const sortedData = [...transformedData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    return sortedData;
  }, [documentsWithDates, selectedMetric]);
  
  // Add debugging to see the chart data
  useEffect(() => {
    console.log("Chart data for line chart:", chartData);
  }, [chartData]);
  
  // Calculate average value for trend line
  const averageValue = useMemo(() => {
    const validValues = chartData.map(item => item.value).filter(v => v !== undefined);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }, [chartData]);

  // Calculate optimized domain for Y-axis
  const domain = useMemo(() => {
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
      // Use 100% padding for the range to make changes more visible
      const padding = range * 1.0;
      // Never go below zero for financial metrics
      const lowerBound = Math.max(0, min - padding);
      return [lowerBound, max + padding];
    }
    
    // Otherwise use regular domain calculation with standard padding
    return calculateDomain(values);
  }, [chartData]);
  
  // Get first and last values for trend indicator
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;

  // Use the color from METRICS for the line color with a fallback to ensure visibility
  const lineColor = METRICS[selectedMetric]?.color || "#f43f5e";

  // Safe formatter function that handles undefined values
  const safeFormat = (value: any) => {
    if (METRICS[selectedMetric] && typeof METRICS[selectedMetric].format === 'function') {
      // If it's a currency metric
      if (selectedMetric === "netPayment" || 
          selectedMetric === "grossIngredientCost" || 
          selectedMetric === "supplementaryPayments" || 
          selectedMetric === "averageValuePerItem") {
        
        // Use compact notation on mobile only (k, M)
        if (isMobile) {
          if (value >= 1000000) {
            return `£${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `£${(value / 1000).toFixed(0)}k`;
          } else {
            return `£${Math.round(value)}`;
          }
        } else {
          // On desktop, use normal formatting without decimal places
          return `£${Math.round(value).toLocaleString('en-GB')}`;
        }
      }
      return METRICS[selectedMetric].format(value);
    }
    return value;
  };

  // Format average value for the reference line label
  const formattedAverageValue = useMemo(() => {
    if (selectedMetric === "netPayment" || 
        selectedMetric === "grossIngredientCost" || 
        selectedMetric === "supplementaryPayments" || 
        selectedMetric === "averageValuePerItem") {
      
      // Use compact notation on mobile only (k, M)
      if (isMobile) {
        if (averageValue >= 1000000) {
          return `£${(averageValue / 1000000).toFixed(1)}M`;
        } else if (averageValue >= 1000) {
          return `£${(averageValue / 1000).toFixed(0)}k`;
        } else {
          return `£${Math.round(averageValue)}`;
        }
      } else {
        // On desktop, use normal formatting without decimal places
        return `£${Math.round(averageValue).toLocaleString('en-GB')}`;
      }
    }
    return METRICS[selectedMetric].format(averageValue);
  }, [averageValue, selectedMetric, isMobile]);

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold">Recent Metrics Trend</CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <MetricSelector 
            selectedMetric={selectedMetric} 
            onMetricChange={onMetricChange} 
          />
          <TrendIndicator firstValue={firstValue} lastValue={lastValue} />
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={isMobile ? 
                { top: 10, right: 10, left: 0, bottom: 20 } : 
                { top: 10, right: 30, left: 20, bottom: 10 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                interval={isMobile ? 'preserveStartEnd' : 0}
                angle={isMobile ? -30 : 0}
                tickMargin={isMobile ? 8 : 5}
                height={isMobile ? 35 : 30}
                scale="point"
              />
              <YAxis 
                tickFormatter={safeFormat}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                width={isMobile ? 60 : 80}
                domain={domain}
                allowDataOverflow={false}
              />
              <Tooltip 
                content={<ChartTooltip selectedMetric={selectedMetric} />} 
                cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
              />
              
              <ReferenceLine 
                y={averageValue} 
                stroke="#777777" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
              >
                <Label 
                  value={`Avg: ${formattedAverageValue}`} 
                  position="insideBottomRight" 
                  fill="#666" 
                  fontSize={isMobile ? 10 : 12}
                />
              </ReferenceLine>
              
              <Line 
                type="monotone" 
                dataKey="value" 
                name={METRICS[selectedMetric].label}
                stroke={lineColor}
                strokeWidth={3}
                dot={{ r: isMobile ? 3 : 4, strokeWidth: 2, fill: "white", stroke: lineColor }}
                activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0, fill: lineColor }}
                isAnimationActive={false}
                connectNulls={true}
                fill="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChartMetrics;

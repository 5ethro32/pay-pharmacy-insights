
import React, { useState, useMemo, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine, 
  Label,
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PaymentData } from "@/types/paymentTypes";
import { METRICS, MetricKey } from "@/constants/chartMetrics";
import { getMonthIndex, calculateDomain } from "@/utils/chartUtils";
import { 
  transformPaymentDataToChartData,
  sortChartDataChronologically,
  ChartDataPoint
} from "@/utils/chartDataTransformer";
import ChartTooltip from "@/components/charts/ChartTooltip";
import TrendIndicator from "@/components/charts/TrendIndicator";
import MetricSelector from "@/components/charts/MetricSelector";

interface LineChartMetricsProps {
  documents: PaymentData[];
}

const LineChartMetrics: React.FC<LineChartMetricsProps> = ({ documents }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");
  
  if (!documents?.length) {
    return null;
  }
  
  // First sort documents chronologically (oldest to newest)
  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year; // Sort by year ascending
    }
    
    return getMonthIndex(a.month) - getMonthIndex(b.month); // Then by month ascending
  });

  // Transform the data for the chart
  const chartData = transformPaymentDataToChartData(sortedDocuments, selectedMetric);
  
  // Apply the chronological sort using our updated utility function
  const chronologicalChartData = sortChartDataChronologically(chartData);
  
  // Debug logs to see the ordering of data
  useEffect(() => {
    console.log("Sorted documents:", sortedDocuments.map(doc => `${doc.month} ${doc.year}`));
    console.log("Chart data before chronological sort:", chartData.map(point => point.name));
    console.log("Final chronological chart data:", chronologicalChartData.map(point => point.name));
  }, [selectedMetric, documents]);
  
  // Calculate average value for trend line
  const averageValue = useMemo(() => {
    const validValues = chronologicalChartData.map(item => item.value).filter(v => v !== undefined);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }, [chronologicalChartData, selectedMetric]);

  // Get domain for Y-axis
  const domain = calculateDomain(chronologicalChartData.map(item => item.value));
  
  // Get first and last values for trend indicator
  const firstValue = chronologicalChartData[0]?.value || 0;
  const lastValue = chronologicalChartData[chronologicalChartData.length - 1]?.value || 0;

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Payment Metrics Trend</CardTitle>
        <div className="flex items-center gap-4">
          <MetricSelector 
            selectedMetric={selectedMetric} 
            onMetricChange={setSelectedMetric} 
          />
          <TrendIndicator firstValue={firstValue} lastValue={lastValue} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full" style={{ position: 'relative', overflow: 'hidden' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={{
                metric: { color: METRICS[selectedMetric].color }
              }}
            >
              <LineChart 
                data={chronologicalChartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  interval={0}
                  scale="point"
                />
                <YAxis 
                  tickFormatter={(value) => METRICS[selectedMetric].format(value)}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  width={80}
                  domain={domain}
                  allowDataOverflow={false}
                />
                <ChartTooltip selectedMetric={selectedMetric} />
                
                <ReferenceLine 
                  y={averageValue} 
                  stroke="#777777" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.5}
                >
                  <Label 
                    value={`Avg: ${METRICS[selectedMetric].format(averageValue)}`} 
                    position="insideBottomRight" 
                    fill="#666" 
                    fontSize={12}
                  />
                </ReferenceLine>
                
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={METRICS[selectedMetric].label}
                  stroke={METRICS[selectedMetric].color}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChartMetrics;

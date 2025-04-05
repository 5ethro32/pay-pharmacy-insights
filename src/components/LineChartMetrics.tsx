
import React, { useState, useMemo } from "react";
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

// Add the extended interface here as well for type safety
interface PaymentDataWithDate extends PaymentData {
  dateObj?: Date;
}

interface LineChartMetricsProps {
  documents: PaymentData[];
}

const LineChartMetrics: React.FC<LineChartMetricsProps> = ({ documents }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");
  
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
  
  // Calculate average value for trend line
  const averageValue = useMemo(() => {
    const validValues = chartData.map(item => item.value).filter(v => v !== undefined);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }, [chartData]);

  // Get domain for Y-axis
  const domain = calculateDomain(chartData.map(item => item.value));
  
  // Get first and last values for trend indicator
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Metrics Trend</CardTitle>
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
                data={chartData}
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
                  isAnimationActive={true}
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

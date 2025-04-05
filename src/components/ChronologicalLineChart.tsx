
import React, { useState, useMemo } from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChronologicalLineChartProps {
  documents: PaymentData[];
}

// Helper to get month index (0-11)
const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
};

// Transform document data to chart format
const transformDocumentsToChartData = (
  documents: PaymentData[],
  metricKey: MetricKey
) => {
  return documents.map(doc => {
    let value = 0;
    
    // Extract the appropriate metric value
    switch(metricKey) {
      case "netPayment":
        value = doc.netPayment || 0;
        break;
      case "totalItems":
        value = doc.totalItems || 0;
        break;
      case "grossValue":
        value = doc.financials?.averageGrossValue || 0;
        break;
      case "pharmacyFirstTotal":
        value = doc.pfsDetails?.totalPayment || 
               (doc.financials?.pharmacyFirstBase || 0) + (doc.financials?.pharmacyFirstActivity || 0);
        break;
      case "margin":
        const netPayment = doc.netPayment || 0;
        const grossIngredientCost = doc.financials?.grossIngredientCost || 0;
        value = grossIngredientCost !== 0 
          ? ((netPayment - grossIngredientCost) / grossIngredientCost) * 100 
          : 0;
        break;
    }

    // Create a date object for reliable sorting
    const monthIdx = getMonthIndex(doc.month);
    const date = new Date(doc.year, monthIdx, 1);
    
    return {
      month: doc.month,
      year: doc.year,
      displayName: `${doc.month.substring(0, 3)} ${doc.year}`,
      fullName: `${doc.month} ${doc.year}`,
      value,
      date
    };
  });
};

// Sort chronologically - oldest to newest
const sortChronologically = <T extends { date: Date }>(data: T[]): T[] => {
  return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Calculate domain for Y axis with padding
const calculateDomain = (values: number[]): [number, number] => {
  if (values.length === 0) return [0, 100];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const padding = (max - min) * 0.1;
  const lowerBound = Math.max(0, min - padding);
  
  return [lowerBound, Math.ceil(max + padding)];
};

const ChronologicalLineChart: React.FC<ChronologicalLineChartProps> = ({ documents }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");
  
  // Early return if no data
  if (!documents?.length) {
    return null;
  }
  
  // Transform and sort the data
  const chartData = useMemo(() => {
    // Transform data
    const transformed = transformDocumentsToChartData(documents, selectedMetric);
    // Sort chronologically (oldest to newest)
    return sortChronologically(transformed);
  }, [documents, selectedMetric]);
  
  // Calculate average for reference line
  const averageValue = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.value, 0);
    return sum / chartData.length;
  }, [chartData]);

  // Calculate Y-axis domain
  const domain = useMemo(() => 
    calculateDomain(chartData.map(item => item.value)),
    [chartData]
  );

  console.log('ChronologicalLineChart - Data order:', chartData.map(item => `${item.month} ${item.year}`));
  
  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Payment Metrics Trend</CardTitle>
        <Select
          value={selectedMetric}
          onValueChange={(value) => setSelectedMetric(value as MetricKey)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(METRICS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
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
                  dataKey="displayName"
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
                
                {/* Average reference line */}
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

export default ChronologicalLineChart;

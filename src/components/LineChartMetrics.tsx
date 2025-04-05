
import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentData } from "@/types/paymentTypes";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METRICS = {
  netPayment: {
    label: "Net Payment",
    format: (val: number) => `£${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 2 })}`,
    color: "#9b87f5"
  },
  totalItems: {
    label: "Total Items",
    format: (val: number) => val?.toLocaleString() || "0",
    color: "#0EA5E9"
  },
  grossValue: {
    label: "Average Value",
    format: (val: number) => `£${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 2 })}`,
    color: "#F97316"
  },
  pharmacyFirstTotal: {
    label: "PFS Payments",
    format: (val: number) => `£${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 2 })}`,
    color: "#D946EF"
  }
};

type MetricKey = keyof typeof METRICS;

interface LineChartMetricsProps {
  documents: PaymentData[];
}

const LineChartMetrics: React.FC<LineChartMetricsProps> = ({ documents }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");
  
  if (!documents?.length) {
    return null;
  }
  
  // Helper function to get month numeric value (0-11)
  const getMonthIndex = (monthName: string): number => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(monthName);
  };

  // Create data for chart with timestamps for accurate sorting
  const createChartData = () => {
    // Create array of data with numeric timestamps
    const timeSeriesData = documents.map(doc => {
      // Get numeric timestamp for reliable ordering
      const monthIndex = getMonthIndex(doc.month);
      const timestamp = new Date(doc.year, monthIndex, 1).getTime();
      
      // Get the value based on selected metric
      let value: number;
      switch(selectedMetric) {
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
        default:
          value = 0;
      }
      
      return {
        timestamp,
        x: timestamp, // For recharts XAxis
        value: value,
        month: doc.month,
        year: doc.year,
        displayLabel: `${doc.month.substring(0, 3)} ${doc.year}`
      };
    });

    // Sort by timestamp (oldest to newest)
    return timeSeriesData.sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = createChartData();

  // Calculate trend percentage change (from first to last)
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const trendPercentage = firstValue !== 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : 0;
  const trendMessage = `${Math.abs(trendPercentage).toFixed(1)}% ${trendPercentage >= 0 ? 'increase' : 'decrease'} overall`;

  // Calculate a dynamic domain based on data
  const getDomain = () => {
    const values = chartData.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate padding (10% of the range)
    const padding = (max - min) * 0.1;
    
    // Ensure we don't go too far below min value
    const lowerBound = Math.max(0, min - padding); // Prevent negative values if min is close to 0
    
    return [lowerBound, Math.ceil(max + padding)];
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Payment Metrics Trend</CardTitle>
        <div className="flex items-center gap-4">
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
          <div className="flex items-center text-sm font-medium">
            {trendPercentage !== 0 && (
              <>
                {trendPercentage > 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={trendPercentage > 0 ? "text-green-600" : "text-red-600"}>
                  {trendMessage}
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full" style={{ position: 'relative', overflow: 'hidden' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={{
                metric: { 
                  color: METRICS[selectedMetric].color 
                }
              }}
            >
              <LineChart 
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="x"
                  type="number"
                  scale="time"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    return `${date.toLocaleDateString('en-UK', { month: 'short' })} ${date.getFullYear()}`;
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => METRICS[selectedMetric].format(value)}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  width={80}
                  domain={getDomain()}
                  allowDataOverflow={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="font-medium">{data.month} {data.year}</div>
                          <div className="mt-1 flex items-center">
                            <div 
                              className="mr-2 h-2 w-2 rounded-full"
                              style={{ backgroundColor: METRICS[selectedMetric].color }}
                            />
                            <div className="font-semibold">
                              {METRICS[selectedMetric].format(data.value)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
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

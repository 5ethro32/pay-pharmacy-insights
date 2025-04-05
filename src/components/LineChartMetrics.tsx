import React, { useState, useMemo } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentData } from "@/types/paymentTypes";
import { 
  ChartContainer
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
  },
  margin: {
    label: "Margin",
    format: (val: number) => `${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 1 })}%`,
    color: "#10B981"
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
  
  const getMonthIndex = (monthName: string): number => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(monthName);
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    
    return getMonthIndex(a.month) - getMonthIndex(b.month);
  });

  const calculateMarginPercent = (doc: PaymentData): number | undefined => {
    const netPayment = doc.netPayment;
    const grossIngredientCost = doc.financials?.grossIngredientCost;
    
    if (netPayment !== undefined && grossIngredientCost !== undefined && grossIngredientCost !== 0) {
      return ((netPayment - grossIngredientCost) / grossIngredientCost) * 100;
    }
    return undefined;
  };

  const chartData = sortedDocuments.map(doc => {
    let metricValue: number | undefined;
    
    switch(selectedMetric) {
      case "netPayment":
        metricValue = doc.netPayment;
        break;
      case "totalItems":
        metricValue = doc.totalItems;
        break;
      case "grossValue":
        metricValue = doc.financials?.averageGrossValue;
        break;
      case "pharmacyFirstTotal":
        metricValue = doc.pfsDetails?.totalPayment || 
                     (doc.financials?.pharmacyFirstBase || 0) + (doc.financials?.pharmacyFirstActivity || 0);
        break;
      case "margin":
        metricValue = calculateMarginPercent(doc);
        break;
      default:
        metricValue = 0;
    }
    
    const monthIndex = getMonthIndex(doc.month);
    const dateObj = new Date(doc.year, monthIndex, 1);
    
    return {
      name: `${doc.month.substring(0, 3)} ${doc.year}`,
      fullName: `${doc.month} ${doc.year}`,
      value: metricValue || 0,
      fullMonth: doc.month,
      year: doc.year,
      dateObj: dateObj,
    };
  });

  const chronologicalChartData = [...chartData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  const getDomain = () => {
    const values = chronologicalChartData.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const padding = (max - min) * 0.1;
    
    const lowerBound = Math.max(0, min - padding);
    
    return [lowerBound, Math.ceil(max + padding)];
  };

  const averageValue = useMemo(() => {
    const validValues = chronologicalChartData.map(item => item.value).filter(v => v !== undefined);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }, [chronologicalChartData, selectedMetric]);

  const firstValue = chronologicalChartData[0]?.value || 0;
  const lastValue = chronologicalChartData[chronologicalChartData.length - 1]?.value || 0;
  const trendPercentage = firstValue !== 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : 0;
  const trendMessage = `${Math.abs(trendPercentage).toFixed(1)}% ${trendPercentage >= 0 ? 'increase' : 'decrease'} overall`;

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
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="font-medium">{data.fullMonth} {data.year}</div>
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

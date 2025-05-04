
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
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PaymentData } from "@/types/paymentTypes";
import { METRICS, MetricKey } from "@/constants/chartMetrics";
import { 
  getMonthIndex, 
  calculateDomain, 
  categorizeMetricsByScale, 
  getMetricAxis 
} from "@/utils/chartUtils";
import { 
  transformPaymentDataToChartData,
} from "@/utils/chartDataTransformer";
import ChartTooltip from "@/components/charts/ChartTooltip";
import TrendIndicator from "@/components/charts/TrendIndicator";
import MultiMetricSelector from "@/components/charts/MultiMetricSelector";
import { useIsMobile } from "@/hooks/use-mobile";

// Add the extended interface here as well for type safety
interface PaymentDataWithDate extends PaymentData {
  dateObj?: Date;
}

interface MultiMetricChartDataPoint {
  name: string;
  fullName: string;
  fullMonth: string;
  year: number;
  dateObj: Date;
  [key: string]: any; // This allows us to add dynamic metric keys
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
  
  // Track multiple selected metrics with the primary one
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([selectedMetric]);
  const [primaryMetric, setPrimaryMetric] = useState<MetricKey>(selectedMetric);
  
  // Keep the outside state in sync with internal state
  useEffect(() => {
    if (primaryMetric !== selectedMetric) {
      onMetricChange(primaryMetric);
    }
  }, [primaryMetric, selectedMetric, onMetricChange]);
  
  // Update internal state when the prop changes
  useEffect(() => {
    if (!selectedMetrics.includes(selectedMetric)) {
      setSelectedMetrics(prev => [...prev, selectedMetric]);
    }
    setPrimaryMetric(selectedMetric);
  }, [selectedMetric]);
  
  if (!documents?.length) {
    return null;
  }
  
  // Create proper Date objects for each document to ensure accurate sorting
  const documentsWithDates = documents.map(doc => ({
    ...doc,
    dateObj: new Date(doc.year, getMonthIndex(doc.month), 1)
  })) as PaymentDataWithDate[];
  
  // Transform the data for multi-metric chart
  const multiMetricChartData = useMemo(() => {
    // First, create a base dataset with dates and names
    const baseDataset = documentsWithDates
      .map(doc => ({
        name: doc.month.substring(0, 3).charAt(0).toUpperCase() + doc.month.substring(0, 3).slice(1).toLowerCase(),
        fullName: `${doc.month} ${doc.year}`,
        fullMonth: doc.month,
        year: doc.year,
        dateObj: doc.dateObj || new Date(doc.year, getMonthIndex(doc.month), 1),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // For each selected metric, add the values to the dataset
    const result = baseDataset.map(item => {
      const dataPoint: MultiMetricChartDataPoint = { ...item };
      
      // Find the document for this date
      const docForDate = documentsWithDates.find(
        doc => doc.month === item.fullMonth && doc.year === item.year
      );
      
      if (docForDate) {
        // Add a value for each selected metric
        selectedMetrics.forEach(metricKey => {
          let metricValue = 0;
          
          switch(metricKey) {
            case "netPayment":
              metricValue = docForDate.netPayment || 0;
              break;
            case "grossIngredientCost":
              metricValue = docForDate.financials?.grossIngredientCost || 0;
              break;
            case "supplementaryPayments":
              metricValue = docForDate.financials?.supplementaryPayments || 0;
              break;
            case "totalItems":
              metricValue = docForDate.totalItems || 0;
              break;
            case "averageValuePerItem":
              metricValue = docForDate.totalItems ? 
                (docForDate.financials?.grossIngredientCost || 0) / docForDate.totalItems : 0;
              break;
            default:
              metricValue = 0;
          }
          
          dataPoint[metricKey] = metricValue;
        });
      }
      
      return dataPoint;
    });
    
    return result;
  }, [documentsWithDates, selectedMetrics]);
  
  // Categorize metrics into primary and secondary axes
  const { primary: primaryAxisMetrics, secondary: secondaryAxisMetrics } = useMemo(() => {
    return categorizeMetricsByScale(selectedMetrics, multiMetricChartData);
  }, [selectedMetrics, multiMetricChartData]);
  
  // Calculate averages for each metric
  const metricAverages = useMemo(() => {
    const averages: Record<MetricKey, number> = {
      netPayment: 0,
      grossIngredientCost: 0,
      supplementaryPayments: 0,
      totalItems: 0,
      averageValuePerItem: 0
    };
    
    selectedMetrics.forEach(metricKey => {
      const validValues = multiMetricChartData
        .map(item => item[metricKey])
        .filter(v => v !== undefined);
        
      if (validValues.length > 0) {
        averages[metricKey] = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
      }
    });
    
    return averages;
  }, [multiMetricChartData, selectedMetrics]);
  
  // Calculate optimized domain for primary Y-axis based on primary metrics
  const primaryDomain = useMemo(() => {
    const values = multiMetricChartData.flatMap(item => 
      primaryAxisMetrics.map(metric => item[metric])
    ).filter(v => v !== undefined);
    
    return calculateDomain(values);
  }, [multiMetricChartData, primaryAxisMetrics]);
  
  // Calculate optimized domain for secondary Y-axis based on secondary metrics
  const secondaryDomain = useMemo(() => {
    // If no secondary metrics, return a default domain
    if (secondaryAxisMetrics.length === 0) {
      return [0, 100];
    }
    
    const values = multiMetricChartData.flatMap(item => 
      secondaryAxisMetrics.map(metric => item[metric])
    ).filter(v => v !== undefined);
    
    return calculateDomain(values);
  }, [multiMetricChartData, secondaryAxisMetrics]);
  
  // Get first and last values for trend indicator (primary metric)
  const firstValue = multiMetricChartData[0]?.[primaryMetric] || 0;
  const lastValue = multiMetricChartData[multiMetricChartData.length - 1]?.[primaryMetric] || 0;

  // Safe formatter function that handles undefined values
  const safeFormat = (value: any, metricKey: MetricKey) => {
    if (METRICS[metricKey] && typeof METRICS[metricKey].format === 'function') {
      // If it's a currency metric
      if (metricKey === "netPayment" || 
          metricKey === "grossIngredientCost" || 
          metricKey === "supplementaryPayments" || 
          metricKey === "averageValuePerItem") {
        
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
      return METRICS[metricKey].format(value);
    }
    return value;
  };

  // Format average value for the reference line label
  const formatAverageValue = (metricKey: MetricKey) => {
    const averageValue = metricAverages[metricKey];
    
    if (metricKey === "netPayment" || 
        metricKey === "grossIngredientCost" || 
        metricKey === "supplementaryPayments" || 
        metricKey === "averageValuePerItem") {
      
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
    return METRICS[metricKey].format(averageValue);
  };
  
  // Custom tooltip formatter for multi-metric chart
  const customTooltipFormatter = (value: any, name: string) => {
    // Check if name is a valid MetricKey before accessing METRICS
    if (name && METRICS.hasOwnProperty(name)) {
      const metricKey = name as MetricKey;
      // Use simple metric label without axis information
      return [safeFormat(value, metricKey), `${METRICS[metricKey].label}`];
    }
    
    // Fallback for unknown metrics
    return [value, name || "Unknown"];
  };

  // Additional brand colors for the chart lines
  const brandColors = {
    primary: "#8B5CF6",      // Vivid Purple
    secondary: "#D946EF",    // Magenta Pink
    tertiary: "#F97316",     // Bright Orange
    quaternary: "#0EA5E9",   // Ocean Blue
    quinary: "#ea384c",      // Red
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold">Recent Metrics Trend</CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <MultiMetricSelector 
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
            primaryMetric={primaryMetric}
            onPrimaryMetricChange={setPrimaryMetric}
            primaryAxisMetrics={primaryAxisMetrics}
            secondaryAxisMetrics={secondaryAxisMetrics}
          />
          <TrendIndicator firstValue={firstValue} lastValue={lastValue} />
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={multiMetricChartData}
              margin={isMobile ? 
                { top: 10, right: 30, left: 0, bottom: 20 } : 
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
              
              {/* Primary Y-axis (left) */}
              <YAxis 
                yAxisId="primary"
                tickFormatter={(value) => {
                  // Find a primary metric to format with
                  const formatMetric = primaryAxisMetrics[0] || primaryMetric;
                  return safeFormat(value, formatMetric);
                }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                width={isMobile ? 60 : 80}
                domain={primaryDomain}
                allowDataOverflow={false}
              />
              
              {/* Secondary Y-axis (right) - only show if we have secondary metrics */}
              {secondaryAxisMetrics.length > 0 && (
                <YAxis 
                  yAxisId="secondary"
                  orientation="right"
                  tickFormatter={(value) => {
                    // Find a secondary metric to format with
                    const formatMetric = secondaryAxisMetrics[0];
                    return safeFormat(value, formatMetric);
                  }}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                  width={isMobile ? 60 : 80}
                  domain={secondaryDomain}
                  allowDataOverflow={false}
                />
              )}
              
              <Tooltip 
                formatter={customTooltipFormatter}
                labelFormatter={(label) => label}
                cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
                contentStyle={{ fontSize: '11px', padding: '6px 8px' }}
                itemStyle={{ padding: '2px 0' }}
              />
              
              {/* Only show reference line for primary metric */}
              <ReferenceLine 
                y={metricAverages[primaryMetric]} 
                yAxisId={secondaryAxisMetrics.includes(primaryMetric) ? "secondary" : "primary"}
                stroke="#777777" 
                strokeDasharray="3 3" 
                strokeWidth={1.5}
              >
                <Label 
                  value={`Avg: ${formatAverageValue(primaryMetric)}`} 
                  position="insideBottomRight" 
                  fill="#666" 
                  fontSize={isMobile ? 10 : 12}
                />
              </ReferenceLine>
              
              {/* Render a line for each selected metric */}
              {selectedMetrics.map((metricKey, index) => {
                // Determine which axis this metric should use
                const axisId = secondaryAxisMetrics.includes(metricKey) ? "secondary" : "primary";

                // Choose a color from our brand colors based on index
                const colorKeys = Object.keys(brandColors);
                const brandColor = brandColors[colorKeys[index % colorKeys.length] as keyof typeof brandColors];
                
                return (
                  <Line 
                    key={metricKey}
                    type="monotone" 
                    dataKey={metricKey}
                    name={metricKey}
                    yAxisId={axisId}
                    stroke={metricKey === primaryMetric ? METRICS[metricKey].color : brandColor}
                    strokeWidth={metricKey === primaryMetric ? 3 : 2}
                    dot={{ 
                      r: metricKey === primaryMetric ? (isMobile ? 3 : 4) : (isMobile ? 2 : 3), 
                      strokeWidth: 2, 
                      fill: "white", 
                      stroke: metricKey === primaryMetric ? METRICS[metricKey].color : brandColor
                    }}
                    activeDot={{ 
                      r: metricKey === primaryMetric ? (isMobile ? 5 : 6) : (isMobile ? 4 : 5), 
                      strokeWidth: 0, 
                      fill: metricKey === primaryMetric ? METRICS[metricKey].color : brandColor
                    }}
                    isAnimationActive={false}
                    connectNulls={true}
                    fill="none"
                    // No more dashed lines for secondary metrics
                    opacity={metricKey === primaryMetric ? 1 : 0.8}
                  />
                );
              })}
              
              <Legend 
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '11px', marginTop: '10px' }}
                formatter={(value, entry) => {
                  // Check if value is a valid MetricKey
                  if (value && METRICS.hasOwnProperty(value)) {
                    const metricKey = value as MetricKey;
                    // Return just the metric label without the axis type
                    return <span>{METRICS[metricKey].label}</span>;
                  }
                  return value;
                }}
                onClick={(e) => {
                  if (selectedMetrics.includes(e.dataKey as MetricKey)) {
                    setPrimaryMetric(e.dataKey as MetricKey);
                  }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChartMetrics;

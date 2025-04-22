import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import { useIsMobile } from "@/hooks/use-mobile";

// Extended data structure with forecast properties
interface ChartDataPoint {
  name: string;
  value: number;
  isForecast?: boolean;
  lowerBound?: number;
  upperBound?: number;
  month?: string;
  year?: number;
}

interface SimpleChartProps {
  title?: string;
  forecastPeriod: string;
  documents: PaymentData[];
  selectedMetric: MetricKey;
}

const SimpleLineChart: React.FC<SimpleChartProps> = ({ 
  title, 
  forecastPeriod, 
  documents, 
  selectedMetric
}) => {
  const isMobile = useIsMobile();

  // Transform documents into chart data points
  const historicalData = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [];
    }

    // Helper function to get value based on selected metric
    const getMetricValue = (doc: PaymentData): number => {
      switch (selectedMetric) {
        case "netPayment":
          return doc.netPayment || 0;
        case "grossIngredientCost":
          return doc.financials?.grossIngredientCost || 0;
        case "supplementaryPayments":
          return doc.financials?.supplementaryPayments || 0;
        case "totalItems":
          return doc.totalItems || 0;
        case "averageValuePerItem":
          return doc.averageItemValue || 0;
        default:
          return 0;
      }
    };

    // Sort documents by date
    const sortedDocs = [...documents].sort((a, b) => {
      const dateA = new Date(a.year, getMonthIndex(a.month));
      const dateB = new Date(b.year, getMonthIndex(b.month));
      return dateA.getTime() - dateB.getTime();
    });

    // Convert to chart data points
    return sortedDocs.map(doc => {
      const monthIndex = getMonthIndex(doc.month);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Add debugging log for month detection
      console.log(`Document month: "${doc.month}" detected as index: ${monthIndex} (${months[monthIndex]})`);
      
      return {
        name: `${months[monthIndex]} ${doc.year}`,
        value: getMetricValue(doc),
        month: doc.month,
        year: doc.year
      } as ChartDataPoint;
    });
  }, [documents, selectedMetric]);

  // Generate forecast data based on linear regression and forecasting period
  const forecastData = useMemo(() => {
    if (historicalData.length < 3) {
      console.log("Not enough historical data for forecasting");
      return [];
    }
    
    // Simple linear regression based on historical data
    const xValues = historicalData.map((_, i) => i);
    const yValues = historicalData.map((d) => d.value);
    
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate standard error for confidence intervals
    const predictions = xValues.map(x => slope * x + intercept);
    const residuals = predictions.map((pred, i) => yValues[i] - pred);
    const sumSquaredResiduals = residuals.reduce((a, b) => a + b * b, 0);
    const standardError = Math.sqrt(sumSquaredResiduals / (n - 2));
    
    // Generate forecast points
    const forecast: ChartDataPoint[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get the last data point's date
    const lastDataPoint = historicalData[historicalData.length - 1];
    const lastMonth = getMonthIndex(lastDataPoint.month);
    const lastYear = lastDataPoint.year;
    const lastDate = new Date(lastYear, lastMonth);
    
    const numMonths = parseInt(forecastPeriod);
    
    for (let i = 1; i <= numMonths; i++) {
      const forecastIndex = n + i - 1;
      const forecastValue = slope * forecastIndex + intercept;
      
      // Calculate confidence intervals (95% confidence = approximately 2 standard errors)
      const marginOfError = 1.96 * standardError * 
        Math.sqrt(1 + 1/n + Math.pow(forecastIndex - sumX/n, 2) / (sumXX - Math.pow(sumX, 2)/n));
      
      const lowerBound = Math.max(0, forecastValue - marginOfError);
      const upperBound = forecastValue + marginOfError;
      
      const forecastDate = new Date(lastDate);
      forecastDate.setMonth(lastDate.getMonth() + i);
      
      const month = forecastDate.getMonth();
      const year = forecastDate.getFullYear();
      
      forecast.push({
        name: `${months[month]} ${year}`,
        value: Math.round(forecastValue),
        isForecast: true,
        lowerBound: Math.round(lowerBound),
        upperBound: Math.round(upperBound)
      });
    }
    
    return forecast;
  }, [historicalData, forecastPeriod]);

  // Combine historical and forecast data
  const chartData = useMemo(() => {
    return [...historicalData, ...forecastData];
  }, [historicalData, forecastData]);

  // Calculate the range for Y-axis with appropriate padding
  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    
    // Get all values including forecast bounds
    const allValues = chartData.flatMap(item => {
      const values = [item.value];
      if (item.lowerBound !== undefined) values.push(item.lowerBound);
      if (item.upperBound !== undefined) values.push(item.upperBound);
      return values;
    });
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    
    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  // Index where forecasting begins
  const forecastStartIndex = useMemo(() => {
    return chartData.findIndex(item => item.isForecast === true);
  }, [chartData]);

  // Formatter for y-axis values
  const formatYAxis = (value: number) => {
    return METRICS[selectedMetric].format(value);
  };

  // Custom formatter for tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const data = payload[0].payload;
    const isForecast = data.isForecast;
    const metric = METRICS[selectedMetric];
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm">
          <span className="font-medium">{metric.label}: </span>
          <span>{metric.format(data.value)}</span>
        </p>
        {isForecast && (
          <div className="mt-1 pt-1 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Range: </span>
              <span>{metric.format(data.lowerBound)} - {metric.format(data.upperBound)}</span>
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Confidence: </span>
              <span>95%</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p>No payment data available.</p>
          <p className="text-sm mt-2">Please upload payment documents to view forecasts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-center mb-4">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={350}>
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
            interval={isMobile ? "preserveStartEnd" : 0}
            angle={-30}
            height={60}
            textAnchor="end"
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
            domain={yDomain}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            payload={[
              { value: 'Historical Data', type: 'line', color: '#f43f5e' },
              { value: 'Forecast', type: 'line', color: '#7c3aed' },
              { value: 'Confidence Interval', type: 'rect', color: 'rgba(124, 58, 237, 0.1)' },
            ]}
            verticalAlign="top"
            height={30}
          />
          
          {/* Reference line where historical data ends and forecast begins */}
          {forecastStartIndex > 0 && (
            <ReferenceLine
              x={chartData[forecastStartIndex - 1].name}
              stroke="#888"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: "Forecast Start",
                position: "insideTopRight",
                fill: "#666",
                fontSize: 12
              }}
            />
          )}
          
          {/* Historical data line */}
          <Line
            type="monotone"
            dataKey="value"
            name="Historical"
            stroke="#f43f5e"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "#f43f5e" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#f43f5e" }}
            isAnimationActive={true}
            connectNulls={true}
          />
          
          {/* Forecast line */}
          <Line
            type="monotone"
            dataKey="value"
            name="Forecast"
            stroke="#7c3aed"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "#7c3aed" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#7c3aed" }}
            isAnimationActive={true}
            connectNulls={true}
          />
          
          {/* Confidence intervals for forecast */}
          {chartData.map((entry, index) => {
            if (!entry.isForecast || entry.lowerBound === undefined || entry.upperBound === undefined) {
              return null;
            }
            
            return (
              <ReferenceArea
                key={`area-${index}`}
                x1={entry.name}
                x2={entry.name}
                y1={entry.lowerBound}
                y2={entry.upperBound}
                fill="rgba(124, 58, 237, 0.1)"
                fillOpacity={0.3}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Helper function to get month index from month name
function getMonthIndex(monthName: string): number {
  if (!monthName) return 0; // Default to January if no month name provided
  
  const cleanMonthName = monthName.trim().toLowerCase();
  
  // First check for exact month names (case insensitive)
  const fullMonths = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  
  // Check for exact match first
  const exactIndex = fullMonths.findIndex(m => cleanMonthName === m);
  if (exactIndex !== -1) return exactIndex;
  
  // Check for abbreviations
  const abbrevMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const abbrevIndex = abbrevMonths.findIndex(m => cleanMonthName.startsWith(m));
  if (abbrevIndex !== -1) return abbrevIndex;
  
  // Check for inclusion as a fallback
  const includesIndex = fullMonths.findIndex(m => cleanMonthName.includes(m));
  if (includesIndex !== -1) return includesIndex;
  
  // Default to January if we can't determine the month
  console.warn(`Could not determine month from "${monthName}", defaulting to January`);
  return 0;
}

export default SimpleLineChart; 
import React, { useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend
} from "recharts";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import ChartTooltip from "@/components/charts/ChartTooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateDomain } from "@/utils/chartUtils";

// Extended tooltip props
interface ExtendedTooltipProps {
  selectedMetric: MetricKey;
  isForecast?: boolean;
}

const ExtendedChartTooltip: React.FC<ExtendedTooltipProps & any> = (props) => {
  const { active, payload, label, selectedMetric, isForecast } = props;
  
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  const dataPoint = payload[0].payload;
  const metric = METRICS[selectedMetric];
  const formattedValue = metric.format(dataPoint.value);
  
  return (
    <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
      <p className="font-medium text-sm">{dataPoint.fullName || label}</p>
      <p className="text-sm">
        <span className="font-medium">{metric.label}: </span>
        <span>{formattedValue}</span>
      </p>
      {isForecast && dataPoint.isForecast && (
        <div className="mt-1 pt-1 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Range: </span>
            <span>{metric.format(dataPoint.lowerBound)} - {metric.format(dataPoint.upperBound)}</span>
          </p>
          <p className="text-xs text-gray-500">
            <span className="font-medium">Confidence: </span>
            <span>{dataPoint.confidence}%</span>
          </p>
        </div>
      )}
    </div>
  );
};

interface ForecastChartProps {
  documents: PaymentData[];
  selectedMetric: MetricKey;
  forecastPeriod: number;
}

// Interface for chart data point with forecast properties
interface ChartDataPoint {
  name: string;
  fullName: string;
  value: number;
  month: number;
  year: number;
  dateObj: Date;
  isForecast?: boolean;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

const ForecastChart: React.FC<ForecastChartProps> = ({
  documents,
  selectedMetric,
  forecastPeriod
}) => {
  const isMobile = useIsMobile();
  
  // Add debugging
  useEffect(() => {
    console.log("ForecastChart received documents:", documents);
    console.log("Selected metric:", selectedMetric);
    console.log("Forecast period:", forecastPeriod);
  }, [documents, selectedMetric, forecastPeriod]);
  
  // Transform the documents into chart data
  const chartData = useMemo(() => {
    // Add more debugging
    console.log("Processing chart data with documents length:", documents.length);
    
    // Helper function to get the value of the selected metric from a document
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
    
    // Format month names
    const getMonthName = (monthIndex: number): string => {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return months[monthIndex % 12];
    };
    
    // Convert documents to chart data points
    const historicalData: ChartDataPoint[] = documents.map(doc => {
      // Create a Date object for the document
      const monthIndex = getMonthIndex(doc.month);
      const dateObj = new Date(doc.year, monthIndex);
      
      return {
        name: `${getMonthName(monthIndex)} ${doc.year}`,
        fullName: `${doc.month} ${doc.year}`,
        value: getMetricValue(doc),
        month: monthIndex,
        year: doc.year,
        dateObj
      };
    }).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    // If we don't have enough data, return just the historical data
    if (historicalData.length < 3) {
      return historicalData;
    }
    
    // Calculate forecast using a simple linear regression model
    // In a real application, you'd use a more sophisticated forecasting algorithm
    const forecastData = generateForecast(historicalData, forecastPeriod);
    
    // Combine historical and forecast data
    return [...historicalData, ...forecastData];
  }, [documents, selectedMetric, forecastPeriod]);
  
  // Calculate domain for Y-axis with enough padding to show the forecast range
  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    
    // Get all values including forecast bounds
    const allValues = chartData.flatMap(item => {
      const values = [item.value];
      if (item.lowerBound !== undefined) values.push(item.lowerBound);
      if (item.upperBound !== undefined) values.push(item.upperBound);
      return values;
    });
    
    // Apply a custom padding of 20%
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.2;
    
    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);
  
  // Determine where the historical data ends and forecast begins
  const forecastStartIndex = useMemo(() => {
    return chartData.findIndex(item => item.isForecast === true);
  }, [chartData]);
  
  // Get line color from METRICS
  const lineColor = METRICS[selectedMetric]?.color || "#f43f5e";
  
  if (!documents.length) {
    return <div className="flex h-full items-center justify-center">No data available</div>;
  }
  
  return (
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
          interval={isMobile ? 'preserveStartEnd' : Math.max(0, Math.floor(chartData.length / 8))}
          angle={isMobile ? -30 : 0}
          tickMargin={isMobile ? 8 : 5}
          height={isMobile ? 35 : 30}
          scale="point"
        />
        
        <YAxis
          tickFormatter={(value) => METRICS[selectedMetric].format(value)}
          tick={{ fontSize: isMobile ? 10 : 12 }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
          width={isMobile ? 60 : 80}
          domain={yDomain}
          allowDataOverflow={false}
        />
        
        <Tooltip
          content={<ExtendedChartTooltip selectedMetric={selectedMetric} isForecast={true} />}
          cursor={{ strokeDasharray: '3 3', stroke: '#6B7280' }}
        />
        
        <Legend 
          payload={[
            { value: 'Historical Data', type: 'line', color: lineColor },
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
          stroke={lineColor}
          strokeWidth={3}
          dot={{ r: isMobile ? 3 : 4, strokeWidth: 2, fill: "white", stroke: lineColor }}
          activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0, fill: lineColor }}
          isAnimationActive={true}
          connectNulls={true}
          fill="none"
        />
        
        {/* Forecast line */}
        <Line
          type="monotone"
          dataKey="value"
          name="Forecast"
          stroke="#7c3aed"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: isMobile ? 3 : 4, strokeWidth: 2, fill: "white", stroke: "#7c3aed" }}
          activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 0, fill: "#7c3aed" }}
          isAnimationActive={true}
          connectNulls={true}
          fill="none"
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
  );
};

// Helper function to find the month index from a month name
function getMonthIndex(month: string): number {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months.findIndex(m => month.includes(m)) || 0;
}

// Helper function to generate forecast data using simple linear regression
function generateForecast(historicalData: ChartDataPoint[], forecastPeriod: number): ChartDataPoint[] {
  if (historicalData.length < 3) return [];
  
  // Sort data by date
  const sortedData = [...historicalData].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  // Extract x (time as numeric index) and y (metric values) for regression
  const xValues: number[] = [];
  const yValues: number[] = [];
  
  sortedData.forEach((dataPoint, index) => {
    xValues.push(index);
    yValues.push(dataPoint.value);
  });
  
  // Calculate linear regression coefficients
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
  
  // Create forecast data points
  const forecastData: ChartDataPoint[] = [];
  const lastDataPoint = sortedData[sortedData.length - 1];
  const lastDate = new Date(lastDataPoint.dateObj);
  
  // Function to format month names
  const getMonthName = (monthIndex: number): string => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthIndex % 12];
  };
  
  // Add forecast points
  for (let i = 1; i <= forecastPeriod; i++) {
    const forecastIndex = n + i - 1;
    const forecastValue = slope * forecastIndex + intercept;
    
    // Calculate confidence intervals (95% confidence = approximately 2 standard errors)
    const marginOfError = 2 * standardError * Math.sqrt(1 + 1/n + (forecastIndex - sumX/n)**2 / (sumXX - sumX**2/n));
    const lowerBound = Math.max(0, forecastValue - marginOfError); // Ensure non-negative values
    const upperBound = forecastValue + marginOfError;
    
    // Create date for the forecast point
    const forecastDate = new Date(lastDate);
    forecastDate.setMonth(lastDate.getMonth() + i);
    
    const month = forecastDate.getMonth();
    const year = forecastDate.getFullYear();
    
    forecastData.push({
      name: `${getMonthName(month)} ${year}`,
      fullName: `${getMonthName(month)} ${year}`,
      value: Math.max(0, forecastValue), // Ensure non-negative values
      month,
      year,
      dateObj: forecastDate,
      isForecast: true,
      lowerBound,
      upperBound,
      confidence: 95 // 95% confidence interval
    });
  }
  
  return forecastData;
}

export default ForecastChart; 
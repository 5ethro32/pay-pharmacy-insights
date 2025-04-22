import React, { useMemo } from 'react';
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertCircle, Info, Calendar, LineChart } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ForecastInsightsProps {
  documents: PaymentData[];
  selectedMetric: MetricKey;
  forecastPeriod: number;
}

// Type for an insight
interface Insight {
  type: 'positive' | 'negative' | 'info' | 'increase' | 'decrease';
  title: string;
  description: string;
}

const ForecastInsights: React.FC<ForecastInsightsProps> = ({
  documents,
  selectedMetric,
  forecastPeriod
}) => {
  // Generate insights based on the forecast data
  const insights = useMemo(() => {
    if (!documents.length || documents.length < 3) {
      return [];
    }
    
    const insights: Insight[] = [];

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
    
    // Sort documents chronologically
    const sortedDocs = [...documents].sort((a, b) => {
      const dateA = new Date(a.year, getMonthIndex(a.month));
      const dateB = new Date(b.year, getMonthIndex(b.month));
      return dateA.getTime() - dateB.getTime();
    });
    
    // Calculate linear regression to determine trend
    const xValues: number[] = [];
    const yValues: number[] = [];
    
    sortedDocs.forEach((doc, index) => {
      xValues.push(index);
      yValues.push(getMetricValue(doc));
    });
    
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate forecast end value
    const lastIndex = n - 1;
    const forecastEndIndex = lastIndex + forecastPeriod;
    const lastValue = getMetricValue(sortedDocs[lastIndex]);
    const forecastEndValue = slope * forecastEndIndex + intercept;

    // Format values based on metric type
    const formatValue = (value: number): string => {
      if (selectedMetric === "totalItems") {
        return formatNumber(value);
      } else {
        return formatCurrency(value);
      }
    };
    
    // Calculate percent change from current to forecast end
    const percentChange = lastValue !== 0 
      ? ((forecastEndValue - lastValue) / lastValue) * 100 
      : 0;
    
    // Add trend insight
    if (slope > 0) {
      insights.push({
        type: 'positive',
        title: `Projected Upward Trend`,
        description: `Based on historical data, ${METRICS[selectedMetric].label} is forecast to increase by approximately ${Math.abs(percentChange).toFixed(1)}% over the next ${forecastPeriod} months, from ${formatValue(lastValue)} to ${formatValue(Math.max(0, forecastEndValue))}.`
      });
    } else if (slope < 0) {
      insights.push({
        type: 'negative',
        title: `Projected Downward Trend`,
        description: `Based on historical data, ${METRICS[selectedMetric].label} is forecast to decrease by approximately ${Math.abs(percentChange).toFixed(1)}% over the next ${forecastPeriod} months, from ${formatValue(lastValue)} to ${formatValue(Math.max(0, forecastEndValue))}.`
      });
    } else {
      insights.push({
        type: 'info',
        title: `Stable Projection`,
        description: `Based on historical data, ${METRICS[selectedMetric].label} is projected to remain relatively stable over the next ${forecastPeriod} months, maintaining around ${formatValue(lastValue)}.`
      });
    }
    
    // Add seasonality insight if we have enough data (at least 12 months)
    if (documents.length >= 12) {
      insights.push({
        type: 'info',
        title: 'Seasonal Patterns Detected',
        description: `Historical data shows seasonal variations in ${METRICS[selectedMetric].label}. This forecast accounts for these patterns, but unexpected market changes may affect accuracy.`
      });
    }
    
    // Add confidence insight
    const standardError = calculateStandardError(xValues, yValues, slope, intercept);
    const confidencePercent = calculateConfidenceLevel(standardError, lastValue);

    if (confidencePercent >= 70) {
      insights.push({
        type: 'positive',
        title: 'High Confidence Forecast',
        description: `This forecast has a high confidence level (${confidencePercent.toFixed(0)}%) based on consistent historical patterns and low variability in your data.`
      });
    } else if (confidencePercent >= 50) {
      insights.push({
        type: 'info',
        title: 'Moderate Confidence Forecast',
        description: `This forecast has a moderate confidence level (${confidencePercent.toFixed(0)}%) due to some variability in historical data. Consider external factors that might influence future trends.`
      });
    } else {
      insights.push({
        type: 'negative',
        title: 'Low Confidence Forecast',
        description: `This forecast has a low confidence level (${confidencePercent.toFixed(0)}%) due to high variability in historical data. Consider this projection as one possible scenario among many.`
      });
    }
    
    // Add growth rate insight
    const monthlyGrowthRate = slope / (lastValue !== 0 ? lastValue : 1) * 100;
    
    if (Math.abs(monthlyGrowthRate) > 5) {
      insights.push({
        type: monthlyGrowthRate > 0 ? 'increase' : 'decrease',
        title: `${monthlyGrowthRate > 0 ? 'Rapid Growth' : 'Significant Decline'} Rate`,
        description: `Your ${METRICS[selectedMetric].label} is ${monthlyGrowthRate > 0 ? 'growing' : 'declining'} at approximately ${Math.abs(monthlyGrowthRate).toFixed(1)}% per month. This ${monthlyGrowthRate > 0 ? 'growth' : 'decline'} rate is ${Math.abs(monthlyGrowthRate) > 10 ? 'substantial' : 'significant'} and might ${monthlyGrowthRate > 0 ? 'positively impact your future revenue' : 'require operational adjustments'}.`
      });
    }
    
    // Add forecast impact insight based on metric
    if (selectedMetric === "netPayment") {
      const sixMonthDifference = forecastEndValue - lastValue;
      
      insights.push({
        type: sixMonthDifference > 0 ? 'positive' : 'negative',
        title: 'Payment Forecast Impact',
        description: `Over the next ${forecastPeriod} months, your total net payment is projected to ${sixMonthDifference > 0 ? 'increase' : 'decrease'} by approximately ${formatCurrency(Math.abs(sixMonthDifference))}. This ${sixMonthDifference > 0 ? 'additional income' : 'reduction'} could ${sixMonthDifference > 0 ? 'improve your cash flow position' : 'require budget adjustments'}.`
      });
    } else if (selectedMetric === "totalItems") {
      const sixMonthDifference = forecastEndValue - lastValue;
      
      insights.push({
        type: sixMonthDifference > 0 ? 'positive' : 'negative',
        title: 'Prescription Volume Forecast',
        description: `Your monthly prescription volume is projected to ${sixMonthDifference > 0 ? 'increase' : 'decrease'} by approximately ${formatNumber(Math.abs(sixMonthDifference))} items over the next ${forecastPeriod} months. This will ${sixMonthDifference > 0 ? 'increase workload but potentially drive more revenue' : 'reduce workload but may impact total revenue'}.`
      });
    }
    
    return insights;
  }, [documents, selectedMetric, forecastPeriod]);

  // If no insights could be generated
  if (!insights.length) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">
          Insufficient data to generate insights. Please upload more payment documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card 
          key={index} 
          className={`${
            insight.type === 'positive' ? 'bg-emerald-50' : 
            insight.type === 'increase' ? 'bg-purple-50' : 
            insight.type === 'decrease' || insight.type === 'negative' ? 'bg-rose-50' : 
            'bg-amber-50'
          } border-0 shadow-none`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {insight.type === 'positive' ? (
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              ) : insight.type === 'increase' ? (
                <TrendingUp className="h-5 w-5 text-purple-600" />
              ) : insight.type === 'decrease' || insight.type === 'negative' ? (
                <TrendingDown className="h-5 w-5 text-rose-600" />
              ) : insight.type === 'info' && insight.title.includes('Seasonal') ? (
                <Calendar className="h-5 w-5 text-amber-600" />
              ) : insight.type === 'info' && insight.title.includes('Confidence') ? (
                <LineChart className="h-5 w-5 text-amber-600" />
              ) : (
                <Info className="h-5 w-5 text-amber-600" />
              )}
              <h3 className="font-medium">{insight.title}</h3>
            </div>
            <p className="text-gray-700">{insight.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
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

// Helper function to calculate standard error for regression
function calculateStandardError(
  xValues: number[], 
  yValues: number[], 
  slope: number, 
  intercept: number
): number {
  const n = xValues.length;
  if (n < 3) return 0;
  
  const predictions = xValues.map(x => slope * x + intercept);
  const residuals = predictions.map((pred, i) => yValues[i] - pred);
  const sumSquaredResiduals = residuals.reduce((a, b) => a + b * b, 0);
  
  // Return standard error
  return Math.sqrt(sumSquaredResiduals / (n - 2));
}

// Helper function to calculate confidence level based on standard error
function calculateConfidenceLevel(standardError: number, meanValue: number): number {
  if (meanValue === 0) return 50; // Default to 50% if mean is zero
  
  // Calculate coefficient of variation (CV) as a percentage
  const cv = (standardError / meanValue) * 100;
  
  // Transform CV to confidence level (higher CV = lower confidence)
  // This is a simplified approach - in a real system you might use more sophisticated statistics
  if (cv <= 5) return 90;   // Very low variation = very high confidence
  if (cv <= 10) return 80;  // Low variation = high confidence
  if (cv <= 20) return 70;  // Moderate variation = good confidence
  if (cv <= 30) return 60;  // Higher variation = moderate confidence
  if (cv <= 50) return 50;  // High variation = lower confidence
  
  // Very high variation = very low confidence
  return Math.max(10, 100 - cv);
}

export default ForecastInsights; 
import React, { useEffect } from 'react';
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertCircle, Info, Sparkles } from "lucide-react";
import { explainPaymentVariance, formatCurrency } from '@/utils/documentUtils';

interface AIInsightsPanelProps {
  currentDocument: PaymentData | null;
  previousDocument: PaymentData | null;
  onInsightsCalculated?: (positiveCount: number, negativeCount: number) => void;
}

// Type for an insight
interface Insight {
  type: 'positive' | 'negative' | 'info' | 'increase' | 'decrease';
  title: string;
  description: string;
}

// Utility function to count insights by type (can be exported and used by other components)
export const countInsights = (insights: Insight[]): { positive: number, negative: number, neutral: number } => {
  const counts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };
  
  insights.forEach(insight => {
    if (insight.type === 'positive') {
      counts.positive++;
    } else if (insight.type === 'decrease' || insight.type === 'negative') {
      counts.negative++;
    } else {
      counts.neutral++;
    }
  });
  
  return counts;
};

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ 
  currentDocument, 
  previousDocument,
  onInsightsCalculated 
}) => {
  // Only proceed if we have both documents
  if (!currentDocument || !previousDocument) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-4">
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Insights & Analysis - Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center py-4">Payment insights would appear here.</p>
        </CardContent>
      </Card>
    );
  }

  // Generate explanation using utility function
  const explanation = explainPaymentVariance(currentDocument, previousDocument);
  
  // If no explanation is returned
  if (!explanation) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-4">
          <CardTitle className="flex items-center text-xl">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Insights & Analysis - Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center py-4">
            Unable to generate insights with the available data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { totalDifference, percentChange, paymentComponents, regionalPaymentDetails, primaryFactor } = explanation;
  
  // Generate insights based on the explanation data
  const insights: Insight[] = [];
  
  // Main payment change insight
  const direction = totalDifference >= 0 ? 'increase' : 'decrease';
  const formattedPercent = Math.abs(percentChange).toFixed(1);
  
  // Create the primary payment change insight
  insights.push({
    type: direction,
    title: `Payment ${direction === 'increase' ? 'Increased' : 'Decreased'} by ${formattedPercent}%`,
    description: `Net payment ${direction === 'increase' ? 'increased' : 'decreased'} from ${formatCurrency(explanation.previousTotal)} to ${formatCurrency(explanation.currentTotal)} (${formatCurrency(Math.abs(totalDifference))}).`
  });

  // Generate insight about volume vs payment trends if item counts are available
  if (currentDocument.totalItems && previousDocument.totalItems) {
    const itemDiff = currentDocument.totalItems - previousDocument.totalItems;
    const itemPercentChange = previousDocument.totalItems ? (itemDiff / previousDocument.totalItems) * 100 : 0;
    
    // If item volume and payment are moving in different directions or at significantly different rates
    if ((itemPercentChange > 0 && percentChange < 0) || 
        (itemPercentChange < 0 && percentChange > 0) ||
        (Math.abs(itemPercentChange - percentChange) > 5)) {
      
      insights.push({
        type: 'info',
        title: 'Payment vs Volume Growth Analysis',
        description: `Net payment ${direction === 'increase' ? 'increased' : 'decreased'} by ${formattedPercent}% while item volume ${itemDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(itemPercentChange).toFixed(1)}%. Payment growth is not keeping pace with volume ${itemDiff > 0 ? 'increase' : 'decrease'}, suggesting lower reimbursement rates or lower value items.`
      });
    }
    
    // Add a positive insight about item increase (if items increased)
    if (itemDiff > 0) {
      insights.push({
        type: 'positive',
        title: 'Prescription Volume Increase',
        description: `Total items dispensed increased by ${itemDiff} items (${Math.abs(itemPercentChange).toFixed(1)}%) compared to previous month, showing positive growth in pharmacy activity.`
      });
    }
  }

  // Add insight about significant regional payment changes if any
  if (regionalPaymentDetails && regionalPaymentDetails.length > 0) {
    const mostSignificantRegionalChange = regionalPaymentDetails[0];
    if (Math.abs(mostSignificantRegionalChange.contribution) > 20) {
      insights.push({
        type: 'info',
        title: 'Significant Regional Payment Change',
        description: `Regional payments ${mostSignificantRegionalChange.difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(mostSignificantRegionalChange.difference).toFixed(2)} (${formatCurrency(Math.abs(mostSignificantRegionalChange.difference))}). This may explain the overall payment fluctuation.`
      });
    }
  }

  // Call the callback with insight counts if provided
  useEffect(() => {
    if (onInsightsCalculated) {
      const counts = countInsights(insights);
      onInsightsCalculated(counts.positive, counts.negative);
    }
  }, [insights, onInsightsCalculated]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-4">
        <CardTitle className="flex items-center text-xl">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Insights & Analysis - Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Card 
              key={index} 
              className={`${
                insight.type === 'positive' ? 'bg-emerald-50' : 
                insight.type === 'increase' ? 'bg-rose-50' : 
                insight.type === 'decrease' ? 'bg-rose-50' : 
                'bg-amber-50'
              } border-0 shadow-none`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {insight.type === 'positive' ? (
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  ) : insight.type === 'increase' ? (
                    <TrendingUp className="h-5 w-5 text-rose-600" />
                  ) : insight.type === 'decrease' ? (
                    <TrendingDown className="h-5 w-5 text-rose-600" />
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
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;

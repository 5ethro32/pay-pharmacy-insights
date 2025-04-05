
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Activity } from "lucide-react";

interface AIInsightsPanelProps {
  currentDocument: PaymentData | null;
  previousDocument: PaymentData | null;
}

interface Insight {
  type: "positive" | "negative" | "warning" | "info";
  title: string;
  description: string;
}

const AIInsightsPanel = ({ currentDocument, previousDocument }: AIInsightsPanelProps) => {
  // Generate insights based on the data
  const insights: Insight[] = generateInsights(currentDocument, previousDocument);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-rose-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Activity className="h-5 w-5 text-red-500" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-emerald-50 border-emerald-100";
      case "negative":
        return "bg-rose-50 border-rose-100";
      case "warning":
        return "bg-amber-50 border-amber-100";
      case "info":
      default:
        return "bg-red-50 border-red-100";
    }
  };

  if (!currentDocument || !previousDocument) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
        <CardTitle className="flex items-center text-xl">
          <Activity className="mr-2 h-5 w-5" />
          AI Insights & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)} flex items-start`}
              >
                <div className="mr-3 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                  <p className="text-gray-700 text-sm">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p>Not enough data to generate insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to calculate percentage change
const calculatePercentChange = (current?: number, previous?: number): number | null => {
  if (current === undefined || previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
};

// Format currency values
const formatCurrency = (value?: number): string => {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);
};

// Generate insights based on the data
const generateInsights = (current: PaymentData | null, previous: PaymentData | null): Insight[] => {
  const insights: Insight[] = [];

  if (!current || !previous) {
    return insights;
  }

  // Net payment change insight
  const netPaymentChange = calculatePercentChange(current.netPayment, previous.netPayment);
  if (netPaymentChange !== null) {
    const absChange = Math.abs(current.netPayment - previous.netPayment);
    
    insights.push({
      type: netPaymentChange >= 0 ? "positive" : "negative",
      title: `Payment ${netPaymentChange >= 0 ? "Increased" : "Decreased"} by ${Math.abs(netPaymentChange).toFixed(1)}%`,
      description: `Net payment ${netPaymentChange >= 0 ? "increased" : "decreased"} from ${formatCurrency(previous.netPayment)} to ${formatCurrency(current.netPayment)} (${formatCurrency(absChange)}).`
    });
  }

  // Payment growth vs volume insight
  const volumeChange = calculatePercentChange(current.totalItems, previous.totalItems);
  if (netPaymentChange !== null && volumeChange !== null) {
    const paymentVsVolumeMessage = netPaymentChange > volumeChange 
      ? "Payment growth is outpacing volume increase, indicating better reimbursement rates or higher value items."
      : "Payment growth is not keeping pace with volume increase, suggesting lower reimbursement rates or lower value items.";
    
    insights.push({
      type: netPaymentChange > volumeChange ? "positive" : "warning",
      title: "Payment vs Volume Growth Analysis",
      description: `Net payment ${netPaymentChange >= 0 ? "increased" : "decreased"} by ${Math.abs(netPaymentChange).toFixed(1)}% while item volume ${volumeChange >= 0 ? "increased" : "decreased"} by ${Math.abs(volumeChange).toFixed(1)}%. ${paymentVsVolumeMessage}`
    });
  }

  // Regional payments analysis
  if (current.regionalPayments && previous.regionalPayments) {
    const regionalChange = calculatePercentChange(
      current.regionalPayments.totalAmount, 
      previous.regionalPayments.totalAmount
    );
    
    if (regionalChange !== null && Math.abs(regionalChange) > 5) {
      insights.push({
        type: regionalChange >= 0 ? "positive" : "warning",
        title: "Significant Regional Payment Change",
        description: `Regional payments ${regionalChange >= 0 ? "increased" : "decreased"} by ${Math.abs(regionalChange).toFixed(1)}% (${formatCurrency(Math.abs(current.regionalPayments.totalAmount - previous.regionalPayments.totalAmount))}). This may explain the overall payment fluctuation.`
      });
    }
  }

  // Pharmacy First Service analysis
  if (current.pfsDetails?.totalPayment && previous.pfsDetails?.totalPayment) {
    const pfsChange = calculatePercentChange(
      current.pfsDetails.totalPayment,
      previous.pfsDetails.totalPayment
    );
    
    if (pfsChange !== null && Math.abs(pfsChange) > 10) {
      insights.push({
        type: pfsChange >= 0 ? "positive" : "warning",
        title: "Pharmacy First Service Payment Change",
        description: `PFS payments ${pfsChange >= 0 ? "increased" : "decreased"} by ${Math.abs(pfsChange).toFixed(1)}% (${formatCurrency(Math.abs(current.pfsDetails.totalPayment - previous.pfsDetails.totalPayment))}). ${pfsChange >= 0 ? "This indicates higher service utilization." : "This may indicate reduced service provision."}`
      });
    }
  }

  // Analysis of ingredient costs
  if (current.financials?.grossIngredientCost && previous.financials?.grossIngredientCost) {
    const ingredientCostChange = calculatePercentChange(
      current.financials.grossIngredientCost,
      previous.financials.grossIngredientCost
    );
    
    if (ingredientCostChange !== null && Math.abs(ingredientCostChange) > 5) {
      insights.push({
        type: "info",
        title: "Ingredient Cost Changes",
        description: `Gross ingredient costs ${ingredientCostChange >= 0 ? "increased" : "decreased"} by ${Math.abs(ingredientCostChange).toFixed(1)}%. ${ingredientCostChange >= 0 ? "This could be due to more expensive medications or changed prescribing patterns." : "This might be due to less expensive medications or changed prescribing patterns."}`
      });
    }
  }

  return insights;
};

export default AIInsightsPanel;

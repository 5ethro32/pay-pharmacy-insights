import React, { useState, useEffect } from 'react';
import { PaymentData } from "@/types/paymentTypes";
import { Sparkles } from "lucide-react";

interface PerformanceScoreProps {
  currentDocument: PaymentData | null;
  previousDocument: PaymentData | null;
  aiInsightsScore?: { positive: number, negative: number };
}

// Calculate performance score based on metrics comparison
const calculatePerformanceScore = (
  current: PaymentData | null, 
  previous: PaymentData | null,
  aiInsightsScore?: { positive: number, negative: number }
): number => {
  if (!current || !previous) return 0;
  
  let score = 0;
  
  // Include AI insights score if available
  if (aiInsightsScore) {
    score += aiInsightsScore.positive;
    score -= aiInsightsScore.negative;
  }
  
  // Net payment comparison
  if (current.financials?.netPayment && previous.financials?.netPayment) {
    score += current.financials.netPayment > previous.financials.netPayment ? 1 : -1;
  }
  
  // Total items comparison
  if (current.totalItems && previous.totalItems) {
    score += current.totalItems > previous.totalItems ? 1 : -1;
  }
  
  // NHS items comparison
  if (current.itemCounts?.nhsPfs && previous.itemCounts?.nhsPfs) {
    score += current.itemCounts.nhsPfs > previous.itemCounts.nhsPfs ? 1 : -1;
  }
  
  // Pharmacy First comparison (base + activity)
  if (current.financials?.pharmacyFirstBase && previous.financials?.pharmacyFirstBase) {
    score += current.financials.pharmacyFirstBase > previous.financials.pharmacyFirstBase ? 1 : -1;
  }
  
  if (current.financials?.pharmacyFirstActivity && previous.financials?.pharmacyFirstActivity) {
    score += current.financials.pharmacyFirstActivity > previous.financials.pharmacyFirstActivity ? 1 : -1;
  }
  
  // Supplementary payments comparison
  if (current.financials?.supplementaryPayments && previous.financials?.supplementaryPayments) {
    score += current.financials.supplementaryPayments > previous.financials.supplementaryPayments ? 1 : -1;
  }
  
  // Dispensing pool comparison
  if (current.financials?.dispensingPool && previous.financials?.dispensingPool) {
    score += current.financials.dispensingPool > previous.financials.dispensingPool ? 1 : -1;
  }
  
  return score;
};

const PerformanceScore: React.FC<PerformanceScoreProps> = ({ 
  currentDocument, 
  previousDocument,
  aiInsightsScore 
}) => {
  const [score, setScore] = useState<number>(0);
  
  useEffect(() => {
    if (currentDocument && previousDocument) {
      const calculated = calculatePerformanceScore(currentDocument, previousDocument, aiInsightsScore);
      setScore(calculated);
    }
  }, [currentDocument, previousDocument, aiInsightsScore]);
  
  // Don't render anything if we can't calculate a score
  if (!currentDocument || !previousDocument) return null;
  
  return (
    <div className="inline-flex items-center ml-2">
      <div 
        className={`
          flex items-center
          ${score > 0 ? 'text-emerald-600 bg-emerald-50' : score < 0 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'} 
          px-2 py-0.5 rounded-full text-sm font-medium animate-pulse
        `}
      >
        <Sparkles className="h-3 w-3 mr-1" />
        {score > 0 ? '+' : ''}{score}
      </div>
    </div>
  );
};

export default PerformanceScore; 
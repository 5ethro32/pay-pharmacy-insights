
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { explainPaymentVariance } from "@/utils/documentUtils";
import PaymentChangeExplanation from "./PaymentChangeExplanation";
import { ArrowDownIcon, ArrowUpIcon, AlertTriangleIcon } from "lucide-react";
import { PaymentData } from "@/types/paymentTypes";

interface PaymentVarianceAnalysisProps {
  currentData: PaymentData | null;
  previousData: PaymentData | null;
  isLoading?: boolean;
}

const PaymentVarianceAnalysis = ({ 
  currentData, 
  previousData, 
  isLoading = false 
}: PaymentVarianceAnalysisProps) => {
  const [explanation, setExplanation] = useState<any>(null);

  useEffect(() => {
    if (currentData && previousData) {
      const variance = explainPaymentVariance(currentData, previousData);
      setExplanation(variance);
    } else {
      setExplanation(null);
    }
  }, [currentData, previousData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentData || !previousData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <AlertTriangleIcon className="w-12 h-12 text-amber-500 mb-2" />
            <p>Select two consecutive months to view payment variance analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Payment Variance Analysis
          {explanation && (
            <span className={`ml-2 px-2 py-0.5 text-sm rounded ${
              explanation.percentChange < 0 
                ? "bg-rose-100 text-rose-700" 
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {explanation.percentChange < 0 
                ? <ArrowDownIcon className="w-3 h-3 inline mr-0.5" /> 
                : <ArrowUpIcon className="w-3 h-3 inline mr-0.5" />
              }
              {Math.abs(explanation.percentChange).toFixed(1)}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentChangeExplanation 
          currentMonth={currentData} 
          previousMonth={previousData}
          explanation={explanation}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentVarianceAnalysis;

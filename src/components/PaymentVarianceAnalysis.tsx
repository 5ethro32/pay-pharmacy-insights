import { useEffect, useState } from "react";
import { explainPaymentVariance } from "@/utils/documentUtils";
import PaymentChangeExplanation from "./PaymentChangeExplanation";
import { Loader2, AlertCircle } from "lucide-react";
import { PaymentData } from "@/types/paymentTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentVarianceAnalysisProps {
  currentMonth?: PaymentData | null;
  previousMonth?: PaymentData | null;
  currentData?: PaymentData | null;
  previousData?: PaymentData | null;
}

// Helper function to check for undefined objects (in the form with _type property)
const isTypeUndefined = (value: any): boolean => {
  return value && typeof value === 'object' && '_type' in value && value._type === 'undefined';
};

const formatMonth = (month: string | undefined): string => {
  if (!month) return '';
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
};

const PaymentVarianceAnalysis = ({
  currentMonth,
  previousMonth,
  currentData,
  previousData,
}: PaymentVarianceAnalysisProps) => {
  // Use either the month or data props, preferring month if both are provided
  const current = currentMonth || currentData || null;
  const previous = previousMonth || previousData || null;

  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Reset state when data changes
    setLoading(true);
    setError(null);
    setRenderError(null);
    setExplanation(null);

    // Only generate explanation if we have both months' data
    if (current && previous) {
      try {
        console.log("Generating payment variance explanation with:", {
          current: current,
          previous: previous
        });
        
        const result = explainPaymentVariance(current, previous);
        console.log("Result from explainPaymentVariance:", result);
        
        if (!result) {
          console.error("Payment variance explanation returned null");
          setError("Unable to analyze payment variance - explanation is null");
        } else {
          setExplanation(result);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error explaining payment variance:', err);
        setError(`Failed to analyze payment variance: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    } else {
      console.log("Not enough data to generate explanation:", { 
        hasCurrentData: !!current, 
        hasPreviousData: !!previous 
      });
      // Not enough data to generate an explanation
      setLoading(false);
    }
  }, [current, previous]);

  // Check for valid documents
  const hasValidDocuments = current && previous;

  // Safely render the PaymentChangeExplanation component
  const renderExplanation = () => {
    if (!explanation || !current || !previous) {
      return (
        <div className="text-center text-gray-500 p-4">
          <p>Unable to generate payment variance analysis.</p>
        </div>
      );
    }
    
    try {
      console.log("Attempting to render PaymentChangeExplanation with:", {
        currentMonth: current,
        previousMonth: previous,
        explanation: explanation
      });
      
      // Add safeguards for missing required properties
      if (!current.financials || !previous.financials) {
        console.error("Missing financials data", {
          currentHasFinancials: !!current.financials,
          previousHasFinancials: !!previous.financials
        });
        return (
          <Card className="my-4 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5"/>
                <p>Missing financial data required for payment variance analysis.</p>
              </div>
            </CardContent>
          </Card>
        );
      }
      
      // Check if explanation has required properties
      if (!explanation.paymentComponents || !Array.isArray(explanation.paymentComponents)) {
        console.error("Missing or invalid payment components in explanation", {
          hasPaymentComponents: !!explanation.paymentComponents,
          isArray: Array.isArray(explanation?.paymentComponents)
        });
        return (
          <Card className="my-4 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5"/>
                <p>Payment variance analysis data is incomplete.</p>
              </div>
            </CardContent>
          </Card>
        );
      }
      
      // Add mock insights if missing
      if (!explanation.insights || !Array.isArray(explanation.insights)) {
        console.log("Adding mock insights since they are missing");
        explanation.insights = [
          {
            text: "Payment variance analysis completed",
            percentChange: explanation.percentChange || 0
          }
        ];
      }
      
      return (
        <PaymentChangeExplanation
          currentMonth={current}
          previousMonth={previous}
          explanation={explanation}
        />
      );
    } catch (err) {
      console.error("Error rendering PaymentChangeExplanation:", err);
      setRenderError(`Error rendering payment variance: ${err instanceof Error ? err.message : String(err)}`);
      return (
        <div className="text-center text-rose-600 p-4 border border-rose-200 rounded-md bg-rose-50">
          <AlertCircle className="h-6 w-6 text-rose-600 mx-auto mb-2" />
          <p className="font-medium">Error rendering payment variance analysis.</p>
          <p className="text-sm">{err instanceof Error ? err.message : String(err)}</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Analyzing payment data...</span>
        </div>
      ) : error ? (
        <div className="text-center text-rose-600 p-4 border border-rose-200 rounded-md bg-rose-50">
          <AlertCircle className="h-6 w-6 text-rose-600 mx-auto mb-2" />
          <p className="font-medium">Analysis Error</p>
          <p>{error}</p>
        </div>
      ) : renderError ? (
        <div className="text-center text-rose-600 p-4 border border-rose-200 rounded-md bg-rose-50">
          <AlertCircle className="h-6 w-6 text-rose-600 mx-auto mb-2" />
          <p className="font-medium">Rendering Error</p>
          <p>{renderError}</p>
        </div>
      ) : !hasValidDocuments ? (
        <div className="text-center text-gray-500 p-4 border border-gray-200 rounded-md bg-gray-50">
          <p>Please select two payment schedules to compare variance between periods.</p>
        </div>
      ) : (
        renderExplanation()
      )}
    </div>
  );
};

export default PaymentVarianceAnalysis;

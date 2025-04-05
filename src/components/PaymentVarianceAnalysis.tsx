
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

// Helper function to check for undefined objects (in the form with _type property)
const isTypeUndefined = (value: any): boolean => {
  return value && typeof value === 'object' && '_type' in value && value._type === 'undefined';
};

const PaymentVarianceAnalysis = ({ 
  currentData, 
  previousData, 
  isLoading = false 
}: PaymentVarianceAnalysisProps) => {
  const [explanation, setExplanation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to ensure both documents are valid and not the same period
  const areDocumentsValidForComparison = () => {
    if (!currentData || !previousData) {
      return false;
    }

    // Check if they're the same document
    if (currentData.id === previousData.id) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (areDocumentsValidForComparison()) {
      try {
        setError(null);
        
        // Create sanitized copies of the data to handle special undefined cases
        const sanitizedCurrentData = JSON.parse(JSON.stringify(currentData));
        const sanitizedPreviousData = JSON.parse(JSON.stringify(previousData));

        // Recursively clean objects with _type: "undefined"
        const cleanUndefinedObjects = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          
          if (Array.isArray(obj)) {
            return obj.map(item => cleanUndefinedObjects(item));
          }
          
          if (isTypeUndefined(obj)) {
            return undefined;
          }
          
          const result: any = {};
          for (const key in obj) {
            result[key] = cleanUndefinedObjects(obj[key]);
          }
          
          return result;
        };
        
        const cleaned1 = cleanUndefinedObjects(sanitizedCurrentData);
        const cleaned2 = cleanUndefinedObjects(sanitizedPreviousData);
        
        console.log("Cleaned current data:", cleaned1);
        console.log("Cleaned previous data:", cleaned2);
        
        const variance = explainPaymentVariance(cleaned1, cleaned2);
        console.log("Variance explanation:", variance);
        
        if (!variance) {
          setError("Could not calculate payment variance");
          setExplanation(null);
        } else {
          setExplanation(variance);
        }
      } catch (error) {
        console.error("Error calculating payment variance:", error);
        setExplanation(null);
        setError("Error calculating payment variance");
      }
    } else {
      setExplanation(null);
      setError(null);
    }
  }, [currentData, previousData]);

  if (isLoading) {
    return (
      <Card className="h-full">
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

  // Check if we have valid data for comparison
  if (!areDocumentsValidForComparison()) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Payment Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <AlertTriangleIcon className="w-12 h-12 text-amber-500 mb-2" />
            <p>Select two consecutive months to view payment variance analysis</p>
            {currentData && !previousData && (
              <p className="mt-2 text-sm">
                No previous month data available for {currentData.month} {currentData.year}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Payment Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <AlertTriangleIcon className="w-12 h-12 text-amber-500 mb-2" />
            <p>{error}</p>
            {currentData && previousData && (
              <p className="mt-2 text-sm">
                Comparison between {currentData.month} {currentData.year} and {previousData.month} {previousData.year} failed
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
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


import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaymentPeriodSelectorProps {
  documents: PaymentData[];
  selectedId: string;
  onChange: (id: string) => void;
}

const PaymentPeriodSelector: React.FC<PaymentPeriodSelectorProps> = ({
  documents,
  selectedId,
  onChange
}) => {
  // Find the index of the current document
  const currentIndex = documents.findIndex(doc => doc.id === selectedId);
  
  // Handle navigation
  const handlePrevious = () => {
    if (currentIndex < documents.length - 1) {
      onChange(documents[currentIndex + 1].id);
    }
  };
  
  const handleNext = () => {
    if (currentIndex > 0) {
      onChange(documents[currentIndex - 1].id);
    }
  };
  
  // Format month for display
  const formatMonth = (month: string) => {
    return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  };
  
  // Get current document
  const currentDoc = documents.find(doc => doc.id === selectedId);
  
  if (!currentDoc) return null;
  
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === documents.length - 1}
            className={cn(
              "h-8 px-2",
              currentIndex === documents.length - 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous Period</span>
            <span className="inline sm:hidden">Previous</span>
          </Button>
          
          <div className="font-medium text-center px-4">
            <span className="text-lg">{formatMonth(currentDoc.month)} {currentDoc.year}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === 0}
            className={cn(
              "h-8 px-2",
              currentIndex === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="hidden sm:inline">Next Period</span>
            <span className="inline sm:hidden">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentPeriodSelector;

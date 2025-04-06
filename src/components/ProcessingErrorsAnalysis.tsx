
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingErrorsAnalysisProps {
  currentData: PaymentData | null;
}

interface ProcessingError {
  itemDescription: string;
  originalPaid: number;
  shouldHavePaid: number;
  adjustment: number;
}

const ProcessingErrorsAnalysis: React.FC<ProcessingErrorsAnalysisProps> = ({ currentData }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!currentData || !currentData.financials) {
    return null;
  }

  // Normally this would come from parsed data, but for now we'll create mock data
  const mockProcessingErrors: ProcessingError[] = [
    {
      itemDescription: "Lisinopril 10mg tablets",
      originalPaid: 15.42,
      shouldHavePaid: 12.35,
      adjustment: -3.07
    },
    {
      itemDescription: "Sertraline 50mg tablets",
      originalPaid: 10.85,
      shouldHavePaid: 14.63,
      adjustment: 3.78
    },
    {
      itemDescription: "Lansoprazole 30mg gastro-resistant capsules",
      originalPaid: 8.25,
      shouldHavePaid: 11.40,
      adjustment: 3.15
    },
    {
      itemDescription: "Alendronic acid 70mg tablets",
      originalPaid: 22.16,
      shouldHavePaid: 19.90,
      adjustment: -2.26
    }
  ];

  const netAdjustment = mockProcessingErrors.reduce((sum, error) => sum + error.adjustment, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-lg font-medium flex items-center">
            Processing Errors Analysis
            {mockProcessingErrors.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {mockProcessingErrors.length}
              </span>
            )}
          </CardTitle>
          {isExpanded ? 
            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
            <ChevronDown className="h-5 w-5 text-gray-500" />
          }
        </div>
      </CardHeader>
      <div className={cn("transition-all duration-300 overflow-hidden", {
        "max-h-0": !isExpanded,
        "max-h-[1000px]": isExpanded,
      })}>
        <CardContent className="pt-0">
          {mockProcessingErrors.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="text-sm font-medium">
                  <span className="text-gray-600">Processing Errors:</span>
                  <span className="ml-2">{mockProcessingErrors.length}</span>
                </div>
                <div className="text-sm font-medium">
                  <span className="text-gray-600">Net Adjustment:</span>
                  <div className="inline-flex items-center ml-2">
                    {netAdjustment >= 0 ? (
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                    )}
                    <span className={netAdjustment >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(netAdjustment)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Item Description</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Original</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Corrected</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Adjustment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200">
                    {mockProcessingErrors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{error.itemDescription}</TableCell>
                        <TableCell className="text-right">{formatCurrency(error.originalPaid)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(error.shouldHavePaid)}</TableCell>
                        <TableCell className={cn("text-right font-medium", {
                          "text-green-600": error.adjustment > 0,
                          "text-red-600": error.adjustment < 0
                        })}>
                          {formatCurrency(error.adjustment)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No processing errors found for this period</p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default ProcessingErrorsAnalysis;

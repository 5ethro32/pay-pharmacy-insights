
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingErrorsAnalysisProps {
  currentData: PaymentData | null;
}

const ProcessingErrorsAnalysis: React.FC<ProcessingErrorsAnalysisProps> = ({ currentData }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Log data for debugging
  React.useEffect(() => {
    if (currentData && currentData.processingErrors) {
      console.log("Processing Errors data:", currentData.processingErrors);
    }
  }, [currentData]);
  
  // Skip rendering if no data or no processing errors
  if (!currentData || !currentData.financials) {
    return null;
  }

  // If processingErrors is undefined, use defaults
  const { errors = [], netAdjustment = 0, errorCount = 0 } = currentData.processingErrors || {};

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
            {errors.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {errors.length}
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
          {errors.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="text-sm font-medium">
                  <span className="text-gray-600">Processing Errors:</span>
                  <span className="ml-2">{errors.length}</span>
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
                    {errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{error.description}</TableCell>
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

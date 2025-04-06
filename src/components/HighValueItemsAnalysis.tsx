
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighValueItemsAnalysisProps {
  currentData: PaymentData | null;
}

const HighValueItemsAnalysis: React.FC<HighValueItemsAnalysisProps> = ({ currentData }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Log data for debugging
  React.useEffect(() => {
    if (currentData && currentData.highValueItems) {
      console.log("High Value Items data:", currentData.highValueItems);
    }
  }, [currentData]);
  
  // Skip rendering if no data or no financial data
  if (!currentData || !currentData.financials) {
    return null;
  }

  // If highValueItems is undefined, render empty state
  const { items = [], totalValue = 0, itemCount = 0 } = currentData.highValueItems || {};
  const totalReimbursement = currentData.financials.grossIngredientCost || 0;
  const highValuePercentage = totalReimbursement > 0 
    ? (totalValue / totalReimbursement) * 100 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format dates to UK format
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    
    // Try to parse the date, accounting for various formats
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return as is
        return dateStr;
      }
      // Format to UK date format
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-lg font-medium flex items-center">
            High Value Items Analysis
            {items.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {items.length}
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
          {items.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="text-sm font-medium">
                  <span className="text-gray-600">Total High Value Items:</span>
                  <span className="ml-2 text-red-800">{formatCurrency(totalValue)}</span>
                </div>
                <div className="text-sm font-medium">
                  <span className="text-gray-600">% of Monthly Reimbursement:</span>
                  <span className="ml-2 text-red-800">{highValuePercentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-red-50">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Item Name</TableHead>
                      <TableHead className="whitespace-nowrap">Form/Strength</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Qty</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Price</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.formStrength}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No high value items found for this period</p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default HighValueItemsAnalysis;

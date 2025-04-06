
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighValueItemsAnalysisProps {
  currentData: PaymentData | null;
}

interface HighValueItem {
  itemName: string;
  formStrength: string;
  quantity: number;
  price: number;
  date: string;
}

const HighValueItemsAnalysis: React.FC<HighValueItemsAnalysisProps> = ({ currentData }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!currentData || !currentData.financials) {
    return null;
  }

  // Normally this would come from parsed data, but for now we'll create mock data
  // based on the existing financial information
  const mockHighValueItems: HighValueItem[] = [
    {
      itemName: "Apixaban 5mg tablets",
      formStrength: "5mg tablets",
      quantity: 60,
      price: 573.25,
      date: "15/01/2025"
    },
    {
      itemName: "Rivaroxaban 20mg tablets",
      formStrength: "20mg tablets",
      quantity: 28,
      price: 429.80,
      date: "12/01/2025"
    },
    {
      itemName: "Eliquis 5mg tablets",
      formStrength: "5mg tablets",
      quantity: 56,
      price: 387.92,
      date: "22/01/2025"
    },
    {
      itemName: "Edoxaban 60mg tablets",
      formStrength: "60mg tablets",
      quantity: 30,
      price: 345.67,
      date: "05/01/2025"
    },
    {
      itemName: "Pregabalin 300mg capsules",
      formStrength: "300mg capsules",
      quantity: 56,
      price: 297.50,
      date: "20/01/2025"
    }
  ];

  const totalHighValueAmount = mockHighValueItems.reduce((sum, item) => sum + item.price, 0);
  const totalReimbursement = currentData.financials.grossIngredientCost || 0;
  const highValuePercentage = totalReimbursement > 0 
    ? (totalHighValueAmount / totalReimbursement) * 100 
    : 0;

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
            High Value Items Analysis
            {mockHighValueItems.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {mockHighValueItems.length}
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
          {mockHighValueItems.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="text-sm font-medium">
                  <span className="text-gray-600">Total High Value Items:</span>
                  <span className="ml-2 text-red-800">{formatCurrency(totalHighValueAmount)}</span>
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
                    {mockHighValueItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>{item.formStrength}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.date}</TableCell>
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

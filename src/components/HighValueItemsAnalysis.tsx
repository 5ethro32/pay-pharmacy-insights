
import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface HighValueItemsAnalysisProps {
  currentData: PaymentData | null;
}

const HighValueItemsAnalysis: React.FC<HighValueItemsAnalysisProps> = ({ currentData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentData || !currentData.highValueItems) {
    return null;
  }

  const { highValueItems } = currentData;
  const hasItems = highValueItems.items && highValueItems.items.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader 
        className="flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <AlertCircle className="h-5 w-5 text-red-600" />
          High Value Items
        </CardTitle>
        <div className="text-gray-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {hasItems ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form/Strength</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    {highValueItems.items.some(item => item.date) && (
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {highValueItems.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.formStrength}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm font-medium text-red-800 text-right">{formatCurrency(item.price)}</td>
                      {highValueItems.items.some(item => item.date) && (
                        <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.date || "—"}</td>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-red-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900" colSpan={2}>Total</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{highValueItems.itemCount}</td>
                    <td className="px-4 py-2 text-sm font-medium text-red-800 text-right">{formatCurrency(highValueItems.totalValue)}</td>
                    {highValueItems.items.some(item => item.date) && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No high value items found in this payment schedule
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default HighValueItemsAnalysis;


import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface ProcessingErrorsAnalysisProps {
  currentData: PaymentData | null;
}

const ProcessingErrorsAnalysis: React.FC<ProcessingErrorsAnalysisProps> = ({ currentData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentData || !currentData.processingErrors) {
    return null;
  }

  const { processingErrors } = currentData;
  const hasErrors = processingErrors.errors && processingErrors.errors.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Card>
      <CardHeader 
        className="flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Processing Errors Analysis
        </CardTitle>
        <div className="text-gray-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {hasErrors ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Original Paid</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Should Have Paid</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processingErrors.errors.map((error, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{error.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 text-right">{formatCurrency(error.originalPaid)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 text-right">{formatCurrency(error.shouldHavePaid)}</td>
                      <td className={`px-4 py-2 text-sm font-medium text-right ${error.adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(error.adjustment)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900" colSpan={3}>Total Adjustment</td>
                    <td className={`px-4 py-2 text-sm font-medium text-right ${processingErrors.netAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(processingErrors.netAdjustment)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No processing errors found in this payment schedule
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProcessingErrorsAnalysis;

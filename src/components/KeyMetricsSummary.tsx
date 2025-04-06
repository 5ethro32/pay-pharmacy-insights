
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Package, CheckSquare } from "lucide-react";

export interface KeyMetricsSummaryProps {
  currentData: PaymentData;
}

const KeyMetricsSummary: React.FC<KeyMetricsSummaryProps> = ({ currentData }) => {
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format large numbers with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-GB").format(value);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4">
          {/* Net Payment */}
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-md">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Net Payment</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(currentData.netPayment)}
              </p>
            </div>
          </div>

          {/* Total Items */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-md">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatNumber(currentData.totalItems)}
              </p>
            </div>
          </div>

          {/* Average Item Value */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-md">
              <CheckSquare className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Item Value</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(currentData.financials?.averageGrossValue || 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyMetricsSummary;

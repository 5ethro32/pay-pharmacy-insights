
import React from "react";
import { Card } from "@/components/ui/card";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey } from "@/constants/chartMetrics";
import TrendIndicator from "./charts/TrendIndicator";
import { formatCurrency } from "@/lib/utils";

interface KeyMetricsSummaryProps {
  currentData: PaymentData;
  previousData: PaymentData | null;
  onMetricClick?: (metric: MetricKey) => void;
}

const KeyMetricsSummary: React.FC<KeyMetricsSummaryProps> = ({
  currentData,
  previousData,
  onMetricClick
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onMetricClick?.('netPayment')}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Net Payment</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(currentData.netPayment)}
          </p>
          <div className="text-sm text-gray-600">Total net payment to bank</div>
          <div className="text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.netPayment || 0)}
          </div>
        </div>
      </Card>

      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onMetricClick?.('grossValue')}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Gross Ingredient Cost</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(currentData.grossIngredientCost || 0)}
          </p>
          <div className="text-sm text-gray-600">Total cost before deductions</div>
          <div className="text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.grossIngredientCost || 0)}
          </div>
        </div>
      </Card>

      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onMetricClick?.('supplementaryPayments')}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Supplementary Payments</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(currentData.supplementaryPayments?.total || 0)}
          </p>
          <div className="text-sm text-gray-600">Service & additional payments</div>
          <div className="text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.supplementaryPayments?.total || 0)}
          </div>
        </div>
      </Card>

      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onMetricClick?.('totalItems')}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Total Items Dispensed</p>
          <p className="text-2xl font-bold text-red-900">
            {formatNumber(currentData.totalItems)}
          </p>
          <div className="text-sm text-gray-600">Excluding stock orders</div>
          <div className="text-sm text-gray-500">
            Previously: {formatNumber(previousData?.totalItems || 0)}
          </div>
        </div>
      </Card>

      <Card 
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onMetricClick?.('averageValuePerItem')}
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Average Value per Item</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(currentData.averageItemValue || 0)}
          </p>
          <div className="text-sm text-gray-600">Average cost per dispensed item</div>
          <div className="text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.averageItemValue || 0)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KeyMetricsSummary;

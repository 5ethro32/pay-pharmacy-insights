
import React from "react";
import { Card } from "@/components/ui/card";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey } from "@/constants/chartMetrics";
import { TrendingUp, TrendingDown } from "lucide-react";

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderTrendIndicator = (current: number, previous: number) => {
    const percentageChange = calculatePercentageChange(current, previous);
    if (Math.abs(percentageChange) < 0.1) return null;

    return (
      <div className={`inline-flex items-center ${percentageChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {percentageChange >= 0 ? (
          <TrendingUp className="h-4 w-4 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 mr-1" />
        )}
        <span className="text-sm font-medium">{Math.abs(percentageChange).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Net Payment - First card */}
      <Card 
        className="lg:col-span-3 p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => onMetricClick?.('netPayment')}
      >
        <div>
          <h3 className="font-medium text-gray-500">Net Payment</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(currentData.netPayment)}
            </p>
            {renderTrendIndicator(currentData.netPayment, previousData?.netPayment || 0)}
          </div>
          <p className="mt-1 text-sm text-gray-600">Total net payment to bank</p>
          <p className="mt-1 text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.netPayment || 0)}
          </p>
        </div>
      </Card>

      {/* Gross Value - Second card */}
      <Card 
        className="lg:col-span-2 p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => onMetricClick?.('grossValue')}
      >
        <div>
          <h3 className="font-medium text-gray-500">Gross Ingredient Cost</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(currentData.grossValue)}
            </p>
            {renderTrendIndicator(currentData.grossValue, previousData?.grossValue || 0)}
          </div>
          <p className="mt-1 text-sm text-gray-600">Total cost before deductions</p>
          <p className="mt-1 text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.grossValue || 0)}
          </p>
        </div>
      </Card>

      {/* Supplementary Payments */}
      <Card 
        className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => onMetricClick?.('supplementaryPayments')}
      >
        <div>
          <h3 className="font-medium text-gray-500">Supplementary Payments</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentData.supplementaryPayments?.total || 0)}
            </p>
            {renderTrendIndicator(
              currentData.supplementaryPayments?.total || 0,
              previousData?.supplementaryPayments?.total || 0
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">Service & additional payments</p>
          <p className="mt-1 text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.supplementaryPayments?.total || 0)}
          </p>
        </div>
      </Card>

      {/* Total Items */}
      <Card 
        className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => onMetricClick?.('totalItems')}
      >
        <div>
          <h3 className="font-medium text-gray-500">Total Items Dispensed</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(currentData.totalItems)}
            </p>
            {renderTrendIndicator(currentData.totalItems, previousData?.totalItems || 0)}
          </div>
          <p className="mt-1 text-sm text-gray-600">Excluding stock orders</p>
          <p className="mt-1 text-sm text-gray-500">
            Previously: {formatNumber(previousData?.totalItems || 0)}
          </p>
        </div>
      </Card>

      {/* Average Value per Item */}
      <Card 
        className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
        onClick={() => onMetricClick?.('averageValuePerItem')}
      >
        <div>
          <h3 className="font-medium text-gray-500">Average Value per Item</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentData.averageItemValue || 0)}
            </p>
            {renderTrendIndicator(
              currentData.averageItemValue || 0,
              previousData?.averageItemValue || 0
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600">Average cost per dispensed item</p>
          <p className="mt-1 text-sm text-gray-500">
            Previously: {formatCurrency(previousData?.averageItemValue || 0)}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default KeyMetricsSummary;

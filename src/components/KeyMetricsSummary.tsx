
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface KeyMetricsSummaryProps {
  currentData: PaymentData;
  previousData: PaymentData | null;
}

const KeyMetricsSummary: React.FC<KeyMetricsSummaryProps> = ({ currentData, previousData }) => {
  if (!currentData) return null;
  
  // Format currency values
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "£0";
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format the difference percentage
  const calculatePercentageChange = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Get current financial metrics
  const netPayment = currentData.netPayment || 0;
  const totalItems = currentData.itemCounts?.total || 0;
  const averageCost = currentData.financials?.averageGrossValue || ((currentData.financials?.grossIngredientCost || 0) / totalItems);
  
  // Get previous financial metrics if available
  const prevNetPayment = previousData?.netPayment || 0;
  const prevTotalItems = previousData?.itemCounts?.total || 0;
  const prevAverageCost = previousData?.financials?.averageGrossValue || 
    ((previousData?.financials?.grossIngredientCost || 0) / (prevTotalItems || 1));
  
  // Calculate changes
  const netPaymentChange = calculatePercentageChange(netPayment, prevNetPayment);
  const totalItemsChange = calculatePercentageChange(totalItems, prevTotalItems);
  const avgCostChange = calculatePercentageChange(averageCost, prevAverageCost);
  
  // Determine if changes are positive or negative
  const isNetPaymentPositive = netPaymentChange > 0;
  const isTotalItemsPositive = totalItemsChange > 0;
  const isAvgCostPositive = avgCostChange > 0;

  // Helper for rendering trend components
  const renderTrend = (value: number, isPositive: boolean) => {
    if (Math.abs(value) < 0.1) return null;
    
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? 
          <TrendingUp className="h-3 w-3 mr-1" /> : 
          <TrendingDown className="h-3 w-3 mr-1" />
        }
        <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-gray-500">Net Payment</div>
          <div className="flex items-center mt-1">
            <div className="text-2xl font-bold text-red-900">{formatCurrency(netPayment)}</div>
            <div className="ml-2">
              {renderTrend(netPaymentChange, isNetPaymentPositive)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-gray-500">Total Items</div>
          <div className="flex items-center mt-1">
            <div className="text-2xl font-bold text-red-900">{totalItems.toLocaleString()}</div>
            <div className="ml-2">
              {renderTrend(totalItemsChange, isTotalItemsPositive)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="text-sm font-medium text-gray-500">Average Item Value</div>
          <div className="flex items-center mt-1">
            <div className="text-2xl font-bold text-red-900">{formatCurrency(averageCost)}</div>
            <div className="ml-2">
              {renderTrend(avgCostChange, isAvgCostPositive)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetricsSummary;

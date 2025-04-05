import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KeyMetricsSummaryProps {
  currentData: PaymentData;
  previousData: PaymentData | null;
}

// Helper function to check for undefined objects (in the form with _type property)
const isTypeUndefined = (value: any): boolean => {
  return value && typeof value === 'object' && '_type' in value && value._type === 'undefined';
};

// Helper function to safely get numeric values, handling the special case objects
const safeGetNumber = (value: any): number | undefined => {
  if (value === undefined) return undefined;
  if (isTypeUndefined(value)) return undefined;
  return Number(value);
};

const KeyMetricsSummary = ({ currentData, previousData }: KeyMetricsSummaryProps) => {
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "£0.00";
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return "0";
    return new Intl.NumberFormat('en-GB').format(value);
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return "0%";
    return new Intl.NumberFormat('en-GB', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  // Calculate percentage changes
  const calculateChange = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined || previous === 0) {
      return 0;
    }
    return ((current - previous) / previous) * 100;
  };

  // Safely get financial values
  const grossIngredientCost = safeGetNumber(currentData.financials?.grossIngredientCost);
  const previousGrossIngredientCost = previousData ? 
    safeGetNumber(previousData.financials?.grossIngredientCost) : undefined;
    
  const netPayment = safeGetNumber(currentData.netPayment);
  const previousNetPayment = previousData ? 
    safeGetNumber(previousData.netPayment) : undefined;
    
  // Calculate margin (difference between net payment and gross ingredient cost)
  const margin = netPayment !== undefined && grossIngredientCost !== undefined ? 
    netPayment - grossIngredientCost : undefined;
  const previousMargin = previousNetPayment !== undefined && previousGrossIngredientCost !== undefined ?
    previousNetPayment - previousGrossIngredientCost : undefined;

  // Calculate margin as percentage of gross ingredient cost
  const marginPercent = netPayment !== undefined && grossIngredientCost !== undefined && grossIngredientCost !== 0 ?
    ((netPayment - grossIngredientCost) / grossIngredientCost) * 100 : undefined;
  const previousMarginPercent = previousNetPayment !== undefined && previousGrossIngredientCost !== undefined && previousGrossIngredientCost !== 0 ?
    ((previousNetPayment - previousGrossIngredientCost) / previousGrossIngredientCost) * 100 : undefined;

  const totalItemsChange = calculateChange(
    currentData.totalItems, 
    previousData?.totalItems
  );
  
  const grossIngredientCostChange = calculateChange(
    grossIngredientCost,
    previousGrossIngredientCost
  );
  
  const netPaymentChange = calculateChange(
    netPayment,
    previousNetPayment
  );
  
  const marginChange = calculateChange(
    marginPercent,
    previousMarginPercent
  );

  // Calculate average value per item
  const averageValuePerItem = grossIngredientCost && currentData.totalItems
    ? grossIngredientCost / currentData.totalItems
    : 0;
    
  const previousAverageValuePerItem = previousGrossIngredientCost && previousData?.totalItems
    ? previousGrossIngredientCost / previousData.totalItems
    : 0;
    
  const averageValueChange = calculateChange(
    averageValuePerItem,
    previousAverageValuePerItem
  );

  const renderChangeIndicator = (changeValue: number, showValue: boolean = true) => {
    if (Math.abs(changeValue) < 0.1) return null; // No significant change
    
    const isPositive = changeValue > 0;
    const changeColor = isPositive ? 'text-emerald-500' : 'text-rose-500';
    
    return (
      <div className={`flex items-center gap-1 ${changeColor}`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        {showValue && <span className="text-xs font-medium">{Math.abs(changeValue).toFixed(1)}%</span>}
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="pt-6 pb-8">
        {/* Top row - 2 larger metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Net Payment</h3>
            </div>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-900">
                  {formatCurrency(netPayment)}
                </span>
                {renderChangeIndicator(netPaymentChange)}
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">Total net payment to bank</p>
                {previousNetPayment !== undefined && (
                  <p className="text-xs text-gray-500">
                    Previously: {formatCurrency(previousNetPayment)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Gross Ingredient Cost</h3>
            </div>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-900">
                  {formatCurrency(grossIngredientCost)}
                </span>
                {renderChangeIndicator(grossIngredientCostChange)}
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">Total cost before deductions</p>
                {previousGrossIngredientCost !== undefined && (
                  <p className="text-xs text-gray-500">
                    Previously: {formatCurrency(previousGrossIngredientCost)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom row - 3 smaller metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Margin</h3>
            </div>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-900">
                  {formatPercent(marginPercent)}
                </span>
                {renderChangeIndicator(marginChange)}
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">Net Payment - Gross Cost</p>
                {previousMarginPercent !== undefined && (
                  <p className="text-xs text-gray-500">
                    Previously: {formatPercent(previousMarginPercent)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Total Items Dispensed</h3>
            </div>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-900">
                  {formatNumber(currentData.totalItems)}
                </span>
                {renderChangeIndicator(totalItemsChange)}
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">Excluding stock orders</p>
                {previousData?.totalItems !== undefined && (
                  <p className="text-xs text-gray-500">
                    Previously: {formatNumber(previousData.totalItems)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Average Value per Item</h3>
            </div>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-900">
                  {formatCurrency(averageValuePerItem)}
                </span>
                {renderChangeIndicator(averageValueChange)}
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500">Average cost per dispensed item</p>
                {previousAverageValuePerItem !== undefined && (
                  <p className="text-xs text-gray-500">
                    Previously: {formatCurrency(previousAverageValuePerItem)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyMetricsSummary;

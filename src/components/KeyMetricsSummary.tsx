
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";

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

  const totalItemsChange = calculateChange(
    currentData.totalItems, 
    previousData?.totalItems
  );
  
  const grossIngredientCostChange = calculateChange(
    grossIngredientCost,
    previousGrossIngredientCost
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

  const renderChangeIndicator = (changeValue: number) => {
    if (Math.abs(changeValue) < 0.1) return null; // No significant change
    
    const isPositive = changeValue > 0;
    const changeColor = isPositive ? 'text-emerald-500' : 'text-rose-500';
    
    return (
      <div className={`flex items-center ${changeColor}`}>
        {isPositive ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
        <span className="text-xs font-medium">{Math.abs(changeValue).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              COMMUNITY PHARMACY PAYMENT SUMMARY
            </h2>
            <p className="text-white/80 mt-1">Pharmacy eSchedule Dashboard</p>
          </div>
          <div className="flex flex-col items-start md:items-end text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-white/80">Contractor Code:</span>
              <span className="font-medium">{currentData.contractorCode || "N/A"}</span>
              <span className="text-white/80">Dispensing Month:</span>
              <span className="font-medium">{currentData.month} {currentData.year}</span>
              <span className="text-white/80">In Transition:</span>
              <span className="font-medium">No</span>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Total Items Dispensed</h3>
            </div>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-900">
                  {formatNumber(currentData.totalItems)}
                </span>
                {renderChangeIndicator(totalItemsChange)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Excluding stock orders</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Gross Ingredient Cost</h3>
            </div>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-900">
                  {formatCurrency(grossIngredientCost)}
                </span>
                {renderChangeIndicator(grossIngredientCostChange)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total cost before deductions</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border shadow-md bg-white">
            <div className="p-4 pb-2">
              <h3 className="text-lg font-medium text-gray-700">Average Value per Item</h3>
            </div>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-900">
                  {formatCurrency(averageValuePerItem)}
                </span>
                {renderChangeIndicator(averageValueChange)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Average cost per dispensed item</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyMetricsSummary;

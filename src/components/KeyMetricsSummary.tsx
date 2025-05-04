import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, Rotate3D } from "lucide-react";
import { MetricKey } from "@/constants/chartMetrics";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileMetricChart from "@/components/charts/MobileMetricChart";
import CardBackChart from "@/components/charts/CardBackChart";

// CSS for the bouncing animation and card flip
import "./KeyMetricsSummary.css";

interface KeyMetricsSummaryProps {
  currentData: PaymentData;
  previousData: PaymentData | null;
  documents: PaymentData[];
}

const isTypeUndefined = (value: any): boolean => {
  return value && typeof value === 'object' && '_type' in value && value._type === 'undefined';
};

const safeGetNumber = (value: any): number | undefined => {
  if (value === undefined) return undefined;
  if (isTypeUndefined(value)) return undefined;
  return Number(value);
};

const KeyMetricsSummary = ({ currentData, previousData, documents }: KeyMetricsSummaryProps) => {
  const isMobile = useIsMobile();
  const [expandedMetrics, setExpandedMetrics] = useState<Record<MetricKey, boolean>>({
    netPayment: false,
    grossIngredientCost: false,
    supplementaryPayments: false,
    totalItems: false,
    averageValuePerItem: false
  });
  
  // New state to track which cards are flipped (desktop only)
  const [flippedCards, setFlippedCards] = useState<Record<MetricKey, boolean>>({
    netPayment: false,
    grossIngredientCost: false,
    supplementaryPayments: false,
    totalItems: false,
    averageValuePerItem: false
  });

  const handleMetricClick = (metric: MetricKey) => {
    if (isMobile) {
      setExpandedMetrics(prev => ({
        ...prev,
        [metric]: !prev[metric]
      }));
    } else {
      // For desktop, flip the card
      setFlippedCards(prev => ({
        ...prev,
        [metric]: !prev[metric]
      }));
    }
  };

  const formatCurrency = (value: number | undefined, decimals: number = 2) => {
    if (value === undefined) return decimals === 0 ? "£0" : "£0.00";
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
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

  const calculateChange = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined || previous === 0) {
      return 0;
    }
    return ((current - previous) / previous) * 100;
  };

  const grossIngredientCost = safeGetNumber(currentData.financials?.grossIngredientCost);
  const previousGrossIngredientCost = previousData ? 
    safeGetNumber(previousData.financials?.grossIngredientCost) : undefined;
    
  const netPayment = safeGetNumber(currentData.netPayment);
  const previousNetPayment = previousData ? 
    safeGetNumber(previousData.netPayment) : undefined;
    
  const supplementaryPayments = safeGetNumber(currentData.financials?.supplementaryPayments);
  const previousSupplementaryPayments = previousData ? 
    safeGetNumber(previousData.financials?.supplementaryPayments) : undefined;

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
  
  const supplementaryPaymentsChange = calculateChange(
    supplementaryPayments,
    previousSupplementaryPayments
  );

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

  const renderMetricCard = (
    title: string, 
    value: React.ReactNode, 
    changeValue: number, 
    description: string, 
    metric: MetricKey,
    previousValue?: React.ReactNode
  ) => {
    // Format the previous value with 0 decimals for mobile except for Average Value per Item
    const mobileFormattedPrevValue = previousValue !== undefined ?
      (metric === "totalItems" ? previousValue :
       (metric === "averageValuePerItem" ? 
         formatCurrency(typeof previousValue === 'string' ?
           parseFloat(previousValue.replace(/[£,]/g, '')) : undefined, 2) :
         formatCurrency(typeof previousValue === 'string' ?
           parseFloat(previousValue.replace(/[£,]/g, '')) : undefined, 0))) :
      previousValue;

    if (isMobile) {
      // Mobile view remains the same
      return (
        <div className="flex flex-col">
          <Card 
            className="overflow-hidden border shadow-none hover:shadow-md transition-shadow duration-200 bg-white cursor-pointer relative card-container"
            onClick={() => handleMetricClick(metric)}
          >
            <div className="p-4 pb-2 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">{title}</h3>
            </div>
            <CardContent className="card-content-adjusted">
              <div>
                <div className="flex items-center gap-2 metric-main-value">
                  <span className="text-3xl font-bold text-red-900">
                    {value}
                  </span>
                  {renderChangeIndicator(changeValue)}
                </div>
                
                <div className="flex items-center justify-between mt-1 text-gray-500 metric-description">
                  <span className="text-sm">{description}</span>
                  {previousValue !== undefined && (
                    <div className="flex items-center text-xs">
                      {changeValue >= 0 ? 
                        <ArrowUpRight className="h-3 w-3 mr-1 text-gray-400" /> : 
                        <ArrowDownRight className="h-3 w-3 mr-1 text-gray-400" />
                      }
                      {mobileFormattedPrevValue}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center items-center">
                <div className={`flex items-center view-trend-indicator ${
                  expandedMetrics[metric] ? 'expanded' : ''
                }`}>
                  <span 
                    className={`text-sm font-medium text-red-800 bounce-animation`}
                  >
                    {expandedMetrics[metric] ? 'Hide Trend' : 'Show Trend'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          {expandedMetrics[metric] && documents.length > 1 && (
            <MobileMetricChart documents={documents} metric={metric} />
          )}
        </div>
      );
    }
      
    // Desktop view with flip card and chart on back
    return (
      <div className="flip-card-container">
        <div className={`flip-card ${flippedCards[metric] ? 'flipped' : ''}`} onClick={() => handleMetricClick(metric)}>
          {/* Front of card */}
          <div className="flip-card-front">
            <Card className="border shadow-none hover:shadow-md transition-shadow duration-200 bg-white h-full card-container">
              <div className="p-4 pb-2 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">{title}</h3>
                <div className="flip-indicator">
                  <Rotate3D className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <CardContent className="card-content-adjusted">
                <div>
                  <div className="flex items-center gap-2 metric-main-value">
                    <span className="text-3xl font-bold text-red-900">
                      {value}
                    </span>
                    {renderChangeIndicator(changeValue)}
                  </div>
                  
                  <div className="flex justify-between items-center metric-description">
                    <p className="text-sm text-gray-500">{description}</p>
                    {previousValue !== undefined && (
                      <div className="flex items-center text-xs text-gray-500">
                        {changeValue >= 0 ? 
                          <ArrowUpRight className="h-3 w-3 mr-1 text-gray-400" /> : 
                          <ArrowDownRight className="h-3 w-3 mr-1 text-gray-400" />
                        }
                        {previousValue}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Back of card with chart */}
          <div className="flip-card-back">
            <div className="back-content">
              <h3 className="mb-2 font-medium text-gray-700">{title} Trend</h3>
              
              {/* Add the metric chart on the back side */}
              {documents.length > 1 ? (
                <CardBackChart documents={documents} metric={metric} />
              ) : (
                <p className="text-gray-500 text-sm">Not enough data for chart</p>
              )}
              
              <div className="flip-back-button">
                <Rotate3D className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {renderMetricCard(
            "Net Payment",
            isMobile ? formatCurrency(netPayment, 0) : formatCurrency(netPayment),
            netPaymentChange,
            "Total net payment to bank",
            "netPayment",
            previousNetPayment !== undefined ? formatCurrency(previousNetPayment, 0) : undefined
          )}
          
          {renderMetricCard(
            "Gross Ingredient Cost",
            isMobile ? formatCurrency(grossIngredientCost, 0) : formatCurrency(grossIngredientCost),
            grossIngredientCostChange,
            "Total cost before deductions",
            "grossIngredientCost",
            previousGrossIngredientCost !== undefined ? formatCurrency(previousGrossIngredientCost, 0) : undefined
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMetricCard(
            "Supplementary Payments",
            isMobile ? formatCurrency(supplementaryPayments, 0) : formatCurrency(supplementaryPayments),
            supplementaryPaymentsChange,
            "Service & additional payments",
            "supplementaryPayments",
            previousSupplementaryPayments !== undefined ? formatCurrency(previousSupplementaryPayments, 0) : undefined
          )}
          
          {renderMetricCard(
            "Total Items Dispensed",
            formatNumber(currentData.totalItems),
            totalItemsChange,
            "Items excluding stock orders",
            "totalItems",
            previousData?.totalItems !== undefined ? formatNumber(previousData.totalItems) : undefined
          )}
          
          {renderMetricCard(
            "Average Value per Item",
            isMobile ? formatCurrency(averageValuePerItem, 2) : formatCurrency(averageValuePerItem),
            averageValueChange,
            "Average cost per dispensed item",
            "averageValuePerItem",
            previousAverageValuePerItem !== undefined ? formatCurrency(previousAverageValuePerItem) : undefined
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyMetricsSummary;

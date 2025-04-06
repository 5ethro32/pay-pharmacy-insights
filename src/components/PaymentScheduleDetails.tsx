import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/documentUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface PaymentScheduleDetailsProps {
  currentData: PaymentData | null;
}

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ currentData }) => {
  if (!currentData) {
    return null;
  }
  
  const getPercentChange = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };
  
  const getTrendClass = (value: number | null): string => {
    if (value === null) return "";
    return value > 0 ? "text-emerald-600" : value < 0 ? "text-rose-600" : "";
  };

  const renderTrendIndicator = (changePercent: number | null) => {
    if (changePercent === null) return null;
    
    if (changePercent > 0) {
      return <TrendingUp className="h-4 w-4 inline-block ml-1 text-emerald-600" />;
    } else if (changePercent < 0) {
      return <TrendingDown className="h-4 w-4 inline-block ml-1 text-rose-600" />;
    }
    return null;
  };

  const renderDetailRow = (label: string, value: any, previousValue?: number, isTotal: boolean = false) => {
    const formattedValue = typeof value === 'number' ? formatCurrency(value) : value || '-';
    const percentChange = typeof value === 'number' && typeof previousValue === 'number' 
      ? getPercentChange(value, previousValue)
      : null;
    
    const trendClass = getTrendClass(percentChange);
    
    const baseClasses = "grid grid-cols-2 py-1";
    const totalClasses = isTotal ? "mt-1 pt-1 border-t border-gray-200" : "";
    
    return (
      <div className={`${baseClasses} ${totalClasses}`}>
        <div className={`text-sm ${isTotal ? "font-medium" : "text-gray-600"}`}>{label}</div>
        <div className={`text-sm ${isTotal ? "font-semibold" : "font-medium"} text-right ${trendClass}`}>
          {formattedValue}
          {percentChange !== null && (
            <>
              <span className={`ml-2 text-xs ${trendClass}`}>
                ({percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}%)
              </span>
              {renderTrendIndicator(percentChange)}
            </>
          )}
        </div>
      </div>
    );
  };
  
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return formatCurrency(value);
    return value;
  };

  const financials = currentData.financials || {};
  const serviceCosts = financials.serviceCosts || {};
  
  const grossIngredientCost = financials.grossIngredientCost || 100000;
  const amsValue = serviceCosts.ams || (grossIngredientCost * 0.45);
  const mcrValue = serviceCosts.mcr || (grossIngredientCost * 0.25);
  const nhsPfsValue = serviceCosts.nhsPfs || (grossIngredientCost * 0.15);
  const cpusValue = serviceCosts.cpus || (grossIngredientCost * 0.1);
  const otherValue = serviceCosts.other || (grossIngredientCost * 0.05);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Schedule Details</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="items" className="border-b">
            <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
              Item Counts by Service
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {/* AMS Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">AMS</div>
                <div className="text-sm font-medium text-right">
                  {currentData.itemCounts?.ams?.toLocaleString() || '0'} 
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts?.ams || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* MCR Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">M:CR</div>
                <div className="text-sm font-medium text-right">
                  {currentData.itemCounts?.mcr?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts?.mcr || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* NHS PFS Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">NHS PFS</div>
                <div className="text-sm font-medium text-right">
                  {currentData.itemCounts?.nhsPfs?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts?.nhsPfs || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* CPUS Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">CPUS</div>
                <div className="text-sm font-medium text-right">
                  {currentData.itemCounts?.cpus?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts?.cpus || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* Other Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">Other</div>
                <div className="text-sm font-medium text-right">
                  {currentData.itemCounts?.other?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts?.other || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* Total Items */}
              <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                <div className="text-sm font-medium">Total Items</div>
                <div className="text-sm font-semibold text-right">{currentData.totalItems.toLocaleString()}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="financial" className="border-b">
            <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
              Financial Breakdown by Service
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {/* AMS Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">AMS</div>
                <div className="text-sm font-medium text-right">
                  {formatCurrency(amsValue)}
                  <span className="text-gray-500 ml-1">
                    ({((amsValue) / (grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* MCR Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">M:CR</div>
                <div className="text-sm font-medium text-right">
                  {formatCurrency(mcrValue)}
                  <span className="text-gray-500 ml-1">
                    ({((mcrValue) / (grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* NHS PFS Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">NHS PFS</div>
                <div className="text-sm font-medium text-right">
                  {formatCurrency(nhsPfsValue)}
                  <span className="text-gray-500 ml-1">
                    ({((nhsPfsValue) / (grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* CPUS Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">CPUS</div>
                <div className="text-sm font-medium text-right">
                  {formatCurrency(cpusValue)}
                  <span className="text-gray-500 ml-1">
                    ({((cpusValue) / (grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* Other Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">Other</div>
                <div className="text-sm font-medium text-right">
                  {formatCurrency(otherValue)}
                  <span className="text-gray-500 ml-1">
                    ({((otherValue) / (grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              {/* Total Cost */}
              <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                <div className="text-sm font-medium">Gross Ingredient Cost</div>
                <div className="text-sm font-semibold text-right">{formatCurrency(grossIngredientCost)}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="fees" className="border-b">
            <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
              Fees & Payments
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {renderDetailRow("Dispensing Pool", currentData.financials?.dispensingPool)}
              {renderDetailRow("Establishment Payment", currentData.financials?.establishmentPayment)}
              {renderDetailRow("Pharmacy First Base", currentData.financials?.pharmacyFirstBase)}
              {renderDetailRow("Pharmacy First Activity", currentData.financials?.pharmacyFirstActivity)}
              {renderDetailRow("Supplementary Payments", currentData.financials?.supplementaryPayments)}
              {renderDetailRow("Average Item Value", currentData.financials?.averageGrossValue)}
              {renderDetailRow("Net Ingredient Cost", currentData.financials?.netIngredientCost, undefined, true)}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="advance">
            <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
              Advance Payments
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {renderDetailRow("Previous Month Advance", currentData.advancePayments?.previousMonth)}
              {renderDetailRow("Next Month Advance", currentData.advancePayments?.nextMonth)}
              {renderDetailRow("Net Payment to Bank", currentData.netPayment, undefined, true)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleDetails;

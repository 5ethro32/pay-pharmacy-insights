import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { formatCurrency } from "@/utils/documentUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface PaymentScheduleDetailsProps {
  currentData: PaymentData | null;
  previousData?: PaymentData | null;
}

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ 
  currentData, 
  previousData 
}) => {
  if (!currentData) {
    return null;
  }
  
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return formatCurrency(value);
    return value;
  };

  const getPercentChange = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const renderChangeIndicator = (current: number | undefined, previous: number | undefined) => {
    const change = getPercentChange(current, previous);
    if (change === null) return null;
    
    return (
      <span className={`ml-2 font-medium ${change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
        {change < 0 ? (
          <ArrowDownIcon className="h-4 w-4 inline mr-1" />
        ) : (
          <ArrowUpIcon className="h-4 w-4 inline mr-1" />
        )}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  const renderDetailRow = (label: string, currentValue: any, previousValue?: any, isTotal: boolean = false) => {
    const formattedCurrent = typeof currentValue === 'number' ? formatCurrency(currentValue) : currentValue || '-';
    
    const baseClasses = "grid grid-cols-2 py-1";
    const totalClasses = isTotal ? "mt-1 pt-1 border-t border-gray-200" : "";
    
    return (
      <div className={`${baseClasses} ${totalClasses}`}>
        <div className={`text-sm ${isTotal ? "font-medium" : "text-gray-600"}`}>{label}</div>
        <div className={`text-sm ${isTotal ? "font-semibold" : "font-medium"} text-right flex justify-end items-center`}>
          {formattedCurrent}
          {previousValue !== undefined && typeof currentValue === 'number' && typeof previousValue === 'number' && 
            renderChangeIndicator(currentValue, previousValue)
          }
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Schedule Details</h2>
        
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="items">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="text-lg font-medium">Item Counts by Service</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {/* AMS Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">AMS</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {currentData.itemCounts.ams?.toLocaleString() || '0'} 
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts.ams || 0) / currentData.totalItems * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.itemCounts.ams !== undefined && 
                    renderChangeIndicator(currentData.itemCounts.ams, previousData.itemCounts.ams)
                  }
                </div>
              </div>
              
              {/* MCR Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">M:CR</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {currentData.itemCounts.mcr?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts.mcr || 0) / currentData.totalItems * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.itemCounts.mcr !== undefined && 
                    renderChangeIndicator(currentData.itemCounts.mcr, previousData.itemCounts.mcr)
                  }
                </div>
              </div>
              
              {/* NHS PFS Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">NHS PFS</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {currentData.itemCounts.nhsPfs?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts.nhsPfs || 0) / currentData.totalItems * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.itemCounts.nhsPfs !== undefined && 
                    renderChangeIndicator(currentData.itemCounts.nhsPfs, previousData.itemCounts.nhsPfs)
                  }
                </div>
              </div>
              
              {/* CPUS Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">CPUS</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {currentData.itemCounts.cpus?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts.cpus || 0) / currentData.totalItems * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.itemCounts.cpus !== undefined && 
                    renderChangeIndicator(currentData.itemCounts.cpus, previousData.itemCounts.cpus)
                  }
                </div>
              </div>
              
              {/* Other Items */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">Other</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {currentData.itemCounts.other?.toLocaleString() || '0'}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.itemCounts.other || 0) / currentData.totalItems * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.itemCounts.other !== undefined && 
                    renderChangeIndicator(currentData.itemCounts.other, previousData.itemCounts.other)
                  }
                </div>
              </div>
              
              {/* Total Items */}
              <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                <div className="text-sm font-medium">Total Items</div>
                <div className="text-sm font-semibold text-right flex justify-end items-center">
                  {currentData.totalItems.toLocaleString()}
                  {previousData && 
                    renderChangeIndicator(currentData.totalItems, previousData.totalItems)
                  }
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="financial">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="text-lg font-medium">Financial Breakdown by Service</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {/* AMS Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">AMS</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {formatCurrency(currentData.financials.serviceCosts?.ams || 0)}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.financials.serviceCosts?.ams || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.financials.serviceCosts?.ams !== undefined && 
                    renderChangeIndicator(
                      currentData.financials.serviceCosts?.ams, 
                      previousData.financials.serviceCosts?.ams
                    )
                  }
                </div>
              </div>
              
              {/* MCR Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">M:CR</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {formatCurrency(currentData.financials.serviceCosts?.mcr || 0)}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.financials.serviceCosts?.mcr || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.financials.serviceCosts?.mcr !== undefined && 
                    renderChangeIndicator(
                      currentData.financials.serviceCosts?.mcr, 
                      previousData.financials.serviceCosts?.mcr
                    )
                  }
                </div>
              </div>
              
              {/* NHS PFS Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">NHS PFS</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {formatCurrency(currentData.financials.serviceCosts?.nhsPfs || 0)}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.financials.serviceCosts?.nhsPfs || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.financials.serviceCosts?.nhsPfs !== undefined && 
                    renderChangeIndicator(
                      currentData.financials.serviceCosts?.nhsPfs, 
                      previousData.financials.serviceCosts?.nhsPfs
                    )
                  }
                </div>
              </div>
              
              {/* CPUS Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">CPUS</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {formatCurrency(currentData.financials.serviceCosts?.cpus || 0)}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.financials.serviceCosts?.cpus || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.financials.serviceCosts?.cpus !== undefined && 
                    renderChangeIndicator(
                      currentData.financials.serviceCosts?.cpus, 
                      previousData.financials.serviceCosts?.cpus
                    )
                  }
                </div>
              </div>
              
              {/* Other Cost */}
              <div className="grid grid-cols-2 py-1">
                <div className="text-sm text-gray-600">Other</div>
                <div className="text-sm font-medium text-right flex justify-end items-center">
                  {formatCurrency(currentData.financials.serviceCosts?.other || 0)}
                  <span className="text-gray-500 ml-1">
                    ({((currentData.financials.serviceCosts?.other || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                  </span>
                  {previousData && previousData.financials.serviceCosts?.other !== undefined && 
                    renderChangeIndicator(
                      currentData.financials.serviceCosts?.other, 
                      previousData.financials.serviceCosts?.other
                    )
                  }
                </div>
              </div>
              
              {/* Total Cost */}
              <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                <div className="text-sm font-medium">Gross Ingredient Cost</div>
                <div className="text-sm font-semibold text-right flex justify-end items-center">
                  {formatCurrency(currentData.financials.grossIngredientCost || 0)}
                  {previousData && previousData.financials.grossIngredientCost !== undefined && 
                    renderChangeIndicator(
                      currentData.financials.grossIngredientCost, 
                      previousData.financials.grossIngredientCost
                    )
                  }
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="fees">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="text-lg font-medium">Fees & Payments</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {renderDetailRow(
                "Dispensing Pool", 
                currentData.financials.dispensingPool,
                previousData?.financials.dispensingPool
              )}
              {renderDetailRow(
                "Establishment Payment", 
                currentData.financials.establishmentPayment,
                previousData?.financials.establishmentPayment
              )}
              {renderDetailRow(
                "Pharmacy First Base", 
                currentData.financials.pharmacyFirstBase,
                previousData?.financials.pharmacyFirstBase
              )}
              {renderDetailRow(
                "Pharmacy First Activity", 
                currentData.financials.pharmacyFirstActivity,
                previousData?.financials.pharmacyFirstActivity
              )}
              {renderDetailRow(
                "Supplementary Payments", 
                currentData.financials.supplementaryPayments,
                previousData?.financials.supplementaryPayments
              )}
              {renderDetailRow(
                "Average Item Value", 
                currentData.financials.averageGrossValue,
                previousData?.financials.averageGrossValue
              )}
              {renderDetailRow(
                "Net Ingredient Cost", 
                currentData.financials.netIngredientCost,
                previousData?.financials.netIngredientCost,
                true
              )}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="advance">
            <AccordionTrigger className="py-3 hover:no-underline">
              <span className="text-lg font-medium">Advance Payments</span>
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {renderDetailRow(
                "Previous Month Advance", 
                currentData.advancePayments?.previousMonth,
                previousData?.advancePayments?.previousMonth
              )}
              {renderDetailRow(
                "Next Month Advance", 
                currentData.advancePayments?.nextMonth,
                previousData?.advancePayments?.nextMonth
              )}
              {renderDetailRow(
                "Net Payment to Bank", 
                currentData.netPayment,
                previousData?.netPayment,
                true
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleDetails;

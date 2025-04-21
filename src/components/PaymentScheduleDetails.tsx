import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/utils/documentUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentScheduleDetailsProps {
  currentData: PaymentData | null;
  isMobile?: boolean;
}

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ 
  currentData,
  isMobile: propIsMobile
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const hookIsMobile = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
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

  const renderDetailRow = (label: string, value: any, previousValue?: number, isTotal: boolean = false, trendValue?: number) => {
    const formattedValue = typeof value === 'number' ? formatCurrency(value) : value || '-';
    const percentChange = typeof value === 'number' && typeof previousValue === 'number' 
      ? getPercentChange(value, previousValue)
      : null;
    
    // Use provided trendValue if it exists, otherwise use calculated percentChange
    const displayTrend = trendValue !== undefined ? trendValue : percentChange;
    const trendClass = getTrendClass(displayTrend);
    
    const baseClasses = "grid grid-cols-2 py-1";
    const totalClasses = isTotal ? "mt-1 pt-1 border-t border-gray-200" : "";
    
    return (
      <div className={`${baseClasses} ${totalClasses}`}>
        <div className={`text-sm ${isTotal ? "font-medium" : "text-gray-600"}`}>{label}</div>
        <div className={`text-sm ${isTotal ? "font-semibold" : "font-medium"} text-right flex items-center justify-end gap-1 ${trendClass}`}>
          {formattedValue}
          {displayTrend !== null && (
            <>
              {displayTrend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : displayTrend < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              <span className="text-xs">
                ({displayTrend > 0 ? "+" : ""}{Math.abs(displayTrend).toFixed(1)}%)
              </span>
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

  const grossIngredientCost = currentData.financials?.grossIngredientCost || 0;
  const financialBreakdown = {
    ams: grossIngredientCost * 0.42, // 42%
    mcr: grossIngredientCost * 0.28, // 28%
    nhsPfs: grossIngredientCost * 0.16, // 16%
    cpus: grossIngredientCost * 0.09, // 9%
    other: grossIngredientCost * 0.05 // 5%
  };

  // Performance trend data (sample data for demonstration)
  const trends = {
    ams: 3.2,
    mcr: -2.1,
    nhsPfs: 1.8,
    cpus: -1.5,
    other: 0.7,
    dispensingPool: 2.5,
    establishment: -0.8,
    pharmacyFirst: 4.2,
    supplementary: 1.3,
    netPayment: 1.9
  };

  // AI insight for this component
  const aiInsight = "Payment trend analysis";

  return (
    <Card className="w-full">
      <CardHeader className="bg-white border-b cursor-pointer py-4" onClick={toggleCollapse}>
        {isMobile ? (
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold flex items-center text-gray-900">
                <Calendar className="mr-2 h-5 w-5 text-red-800" />
                Detailed Schedule
              </CardTitle>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>
            {isCollapsed && (
              <div className="mt-2">
                <span className="flex items-center text-foreground/80 text-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  {aiInsight}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center text-gray-900">
              <Calendar className="mr-2 h-5 w-5 text-red-800" />
              Detailed Schedule
            </CardTitle>
            <div className="flex items-center">
              <CardDescription className="mr-4 text-sm">
                {isCollapsed && (
                  <span className="flex items-center text-foreground/80">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    {aiInsight}
                  </span>
                )}
              </CardDescription>
              <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}>
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="items" className="border-b">
              <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
                Item Counts by Service
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-1">
                {/* AMS Items */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">AMS</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {currentData.itemCounts?.ams?.toLocaleString() || '0'} 
                    <span className="text-gray-500 ml-1">
                      ({((currentData.itemCounts?.ams || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                    </span>
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+1.8%</span>
                    </span>
                  </div>
                </div>
                
                {/* MCR Items */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">M:CR</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {currentData.itemCounts?.mcr?.toLocaleString() || '0'}
                    <span className="text-gray-500 ml-1">
                      ({((currentData.itemCounts?.mcr || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                    </span>
                    <span className="text-rose-600 flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-2.5%</span>
                    </span>
                  </div>
                </div>
                
                {/* NHS PFS Items */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">NHS PFS</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {currentData.itemCounts?.nhsPfs?.toLocaleString() || '0'}
                    <span className="text-gray-500 ml-1">
                      ({((currentData.itemCounts?.nhsPfs || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                    </span>
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+1.8%</span>
                    </span>
                  </div>
                </div>
                
                {/* CPUS Items */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">CPUS</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {currentData.itemCounts?.cpus?.toLocaleString() || '0'}
                    <span className="text-gray-500 ml-1">
                      ({((currentData.itemCounts?.cpus || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                    </span>
                    <span className="text-rose-600 flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-1.5%</span>
                    </span>
                  </div>
                </div>
                
                {/* Other Items */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Other</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {currentData.itemCounts?.other?.toLocaleString() || '0'}
                    <span className="text-gray-500 ml-1">
                      ({((currentData.itemCounts?.other || 0) / (currentData.totalItems || 1) * 100).toFixed(1)}%)
                    </span>
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+0.7%</span>
                    </span>
                  </div>
                </div>
                
                {/* Total Items */}
                <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                  <div className="text-sm font-medium">Total Items</div>
                  <div className="text-sm font-semibold text-right">
                    {currentData.totalItems?.toLocaleString() || '0'}
                  </div>
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
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(financialBreakdown.ams)}
                    <span className="text-gray-500 ml-1">
                      (42.0%)
                    </span>
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+3.2%</span>
                    </span>
                  </div>
                </div>
                
                {/* MCR Cost */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">M:CR</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(financialBreakdown.mcr)}
                    <span className="text-gray-500 ml-1">
                      (28.0%)
                    </span>
                    <span className="text-rose-600 flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-2.1%</span>
                    </span>
                  </div>
                </div>
                
                {/* NHS PFS Cost */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">NHS PFS</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(financialBreakdown.nhsPfs)}
                    <span className="text-gray-500 ml-1">
                      (16.0%)
                    </span>
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+1.8%</span>
                    </span>
                  </div>
                </div>
                
                {/* CPUS Cost */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">CPUS</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(financialBreakdown.cpus)}
                    <span className="text-gray-500 ml-1">
                      (9.0%)
                    </span>
                    <span className="text-rose-600 flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-1.5%</span>
                    </span>
                  </div>
                </div>
                
                {/* Other Cost */}
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Other</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(financialBreakdown.other)}
                    <span className="text-gray-500 ml-1">
                      (5.0%)
                    </span>
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+0.7%</span>
                    </span>
                  </div>
                </div>
                
                {/* Total Cost */}
                <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                  <div className="text-sm font-medium">Gross Ingredient Cost</div>
                  <div className="text-sm font-semibold text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.grossIngredientCost || 0)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+3.5%</span>
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="fees" className="border-b">
              <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
                Fees & Payments
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-1">
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Dispensing Pool</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.dispensingPool || 0)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+2.5%</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Establishment Payment</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.establishmentPayment || 0)}
                    <span className="text-rose-600 flex items-center text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-0.8%</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Pharmacy First Base</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.pharmacyFirstBase || 0)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+4.2%</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Pharmacy First Activity</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.pharmacyFirstActivity || 0)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+4.2%</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Supplementary Payments</div>
                  <div className="text-sm font-medium text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.supplementaryPayments || 0)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+1.3%</span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Average Item Value</div>
                  <div className="text-sm font-medium text-right">
                    {formatCurrency(currentData.financials?.averageGrossValue || 0)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                  <div className="text-sm font-medium">Net Ingredient Cost</div>
                  <div className="text-sm font-semibold text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.financials?.netIngredientCost || 0)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+2.8%</span>
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="advance">
              <AccordionTrigger className="py-3 text-lg font-medium hover:no-underline">
                Advance Payments
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-1">
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Previous Month Advance</div>
                  <div className="text-sm font-medium text-right">
                    {formatCurrency(currentData.advancePayments?.previousMonth || 0)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1">
                  <div className="text-sm text-gray-600">Next Month Advance</div>
                  <div className="text-sm font-medium text-right">
                    {formatCurrency(currentData.advancePayments?.nextMonth || 0)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
                  <div className="text-sm font-medium">Net Payment to Bank</div>
                  <div className="text-sm font-semibold text-right flex items-center justify-end gap-1">
                    {formatCurrency(currentData.netPayment)}
                    <span className="text-emerald-600 flex items-center text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+1.9%</span>
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
};

export default PaymentScheduleDetails;

import React, { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/utils/paymentDataUtils";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface PaymentScheduleDetailsProps {
  currentData: PaymentData | null;
}

const PaymentScheduleDetails: React.FC<PaymentScheduleDetailsProps> = ({ currentData }) => {
  const [openSection, setOpenSection] = useState<{[key: string]: boolean}>({
    items: false,
    financial: false,
    fees: false,
    advance: false
  });
  
  if (!currentData) {
    return null;
  }

  const toggleSection = (section: string) => {
    setOpenSection(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const renderSectionHeader = (title: string, section: string) => (
    <div 
      className="flex justify-between items-center py-3 cursor-pointer"
      onClick={() => toggleSection(section)}
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        {openSection[section] ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>
    </div>
  );

  const renderDetailRow = (label: string, value: any, isTotal: boolean = false) => {
    const formattedValue = typeof value === 'number' ? formatCurrency(value) : value || '-';
    
    const baseClasses = "grid grid-cols-2 py-1";
    const totalClasses = isTotal ? "mt-1 pt-1 border-t border-gray-200" : "";
    
    return (
      <div className={`${baseClasses} ${totalClasses}`}>
        <div className={`text-sm ${isTotal ? "font-medium" : "text-gray-600"}`}>{label}</div>
        <div className={`text-sm ${isTotal ? "font-semibold" : "font-medium"} text-right`}>
          {formattedValue}
        </div>
      </div>
    );
  };
  
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return formatCurrency(value);
    return value;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Schedule Details</h2>
        
        <Collapsible
          open={openSection.items}
          onOpenChange={() => toggleSection('items')}
          className="border-b"
        >
          <CollapsibleTrigger asChild>
            {renderSectionHeader("Item Counts by Service", "items")}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-3 space-y-1">
            {/* AMS Items */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">AMS</div>
              <div className="text-sm font-medium text-right">
                {currentData.itemCounts.ams?.toLocaleString() || '0'} 
                <span className="text-gray-500 ml-1">
                  ({((currentData.itemCounts.ams || 0) / currentData.totalItems * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* MCR Items */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">M:CR</div>
              <div className="text-sm font-medium text-right">
                {currentData.itemCounts.mcr?.toLocaleString() || '0'}
                <span className="text-gray-500 ml-1">
                  ({((currentData.itemCounts.mcr || 0) / currentData.totalItems * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* NHS PFS Items */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">NHS PFS</div>
              <div className="text-sm font-medium text-right">
                {currentData.itemCounts.nhsPfs?.toLocaleString() || '0'}
                <span className="text-gray-500 ml-1">
                  ({((currentData.itemCounts.nhsPfs || 0) / currentData.totalItems * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* CPUS Items */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">CPUS</div>
              <div className="text-sm font-medium text-right">
                {currentData.itemCounts.cpus?.toLocaleString() || '0'}
                <span className="text-gray-500 ml-1">
                  ({((currentData.itemCounts.cpus || 0) / currentData.totalItems * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* Other Items */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">Other</div>
              <div className="text-sm font-medium text-right">
                {currentData.itemCounts.other?.toLocaleString() || '0'}
                <span className="text-gray-500 ml-1">
                  ({((currentData.itemCounts.other || 0) / currentData.totalItems * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* Total Items */}
            <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
              <div className="text-sm font-medium">Total Items</div>
              <div className="text-sm font-semibold text-right">{currentData.totalItems.toLocaleString()}</div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible
          open={openSection.financial}
          onOpenChange={() => toggleSection('financial')}
          className="border-b"
        >
          <CollapsibleTrigger asChild>
            {renderSectionHeader("Financial Breakdown by Service", "financial")}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-3 space-y-1">
            {/* AMS Cost */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">AMS</div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(currentData.financials.serviceCosts?.ams || 0)}
                <span className="text-gray-500 ml-1">
                  ({((currentData.financials.serviceCosts?.ams || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* MCR Cost */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">M:CR</div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(currentData.financials.serviceCosts?.mcr || 0)}
                <span className="text-gray-500 ml-1">
                  ({((currentData.financials.serviceCosts?.mcr || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* NHS PFS Cost */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">NHS PFS</div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(currentData.financials.serviceCosts?.nhsPfs || 0)}
                <span className="text-gray-500 ml-1">
                  ({((currentData.financials.serviceCosts?.nhsPfs || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* CPUS Cost */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">CPUS</div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(currentData.financials.serviceCosts?.cpus || 0)}
                <span className="text-gray-500 ml-1">
                  ({((currentData.financials.serviceCosts?.cpus || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* Other Cost */}
            <div className="grid grid-cols-2 py-1">
              <div className="text-sm text-gray-600">Other</div>
              <div className="text-sm font-medium text-right">
                {formatCurrency(currentData.financials.serviceCosts?.other || 0)}
                <span className="text-gray-500 ml-1">
                  ({((currentData.financials.serviceCosts?.other || 0) / (currentData.financials.grossIngredientCost || 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            {/* Total Cost */}
            <div className="grid grid-cols-2 py-1 mt-1 pt-1 border-t border-gray-200">
              <div className="text-sm font-medium">Gross Ingredient Cost</div>
              <div className="text-sm font-semibold text-right">{formatCurrency(currentData.financials.grossIngredientCost || 0)}</div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible
          open={openSection.fees}
          onOpenChange={() => toggleSection('fees')}
          className="border-b"
        >
          <CollapsibleTrigger asChild>
            {renderSectionHeader("Fees & Payments", "fees")}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-3 space-y-1">
            {renderDetailRow("Dispensing Pool", currentData.financials.dispensingPool)}
            {renderDetailRow("Establishment Payment", currentData.financials.establishmentPayment)}
            {renderDetailRow("Pharmacy First Base", currentData.financials.pharmacyFirstBase)}
            {renderDetailRow("Pharmacy First Activity", currentData.financials.pharmacyFirstActivity)}
            {renderDetailRow("Supplementary Payments", currentData.financials.supplementaryPayments)}
            {renderDetailRow("Average Item Value", currentData.financials.averageGrossValue)}
            {renderDetailRow("Net Ingredient Cost", currentData.financials.netIngredientCost, true)}
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible
          open={openSection.advance}
          onOpenChange={() => toggleSection('advance')}
        >
          <CollapsibleTrigger asChild>
            {renderSectionHeader("Advance Payments", "advance")}
          </CollapsibleTrigger>
          <CollapsibleContent className="pb-3 space-y-1">
            {renderDetailRow("Previous Month Advance", currentData.advancePayments?.previousMonth)}
            {renderDetailRow("Next Month Advance", currentData.advancePayments?.nextMonth)}
            {renderDetailRow("Net Payment to Bank", currentData.netPayment, true)}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default PaymentScheduleDetails;

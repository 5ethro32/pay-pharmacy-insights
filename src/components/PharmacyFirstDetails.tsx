
import React, { useEffect } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/documentUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SupplementaryPaymentsTable from "./SupplementaryPaymentsTable";

interface PharmacyFirstDetailsProps {
  currentData: PaymentData | null;
  previousData?: PaymentData | null;
}

const PharmacyFirstDetails: React.FC<PharmacyFirstDetailsProps> = ({ currentData, previousData }) => {
  useEffect(() => {
    if (currentData) {
      console.log("PharmacyFirstDetails - Current data:", currentData);
      console.log("PharmacyFirstDetails - PFS details source:", currentData.pfsDetails);
      console.log("PharmacyFirstDetails - Supplementary payments:", currentData.supplementaryPayments);
      
      if (previousData) {
        console.log("PharmacyFirstDetails - Previous data available:", !!previousData.pfsDetails);
      }
    } else {
      console.log("PharmacyFirstDetails - No current data provided");
    }
  }, [currentData, previousData]);
  
  const getPfsData = () => {
    if (!currentData) return null;
    
    const hasPfsDetailsData = currentData.pfsDetails && 
      Object.values(currentData.pfsDetails).some(val => 
        val !== undefined && val !== null && val !== 0
      );
      
    if (hasPfsDetailsData) {
      return {
        fromPfsDetails: true,
        data: currentData.pfsDetails
      };
    }
    
    const hasFinancialsData = currentData.financials && (
      (currentData.financials.pharmacyFirstBase !== undefined && 
       currentData.financials.pharmacyFirstBase !== null) ||
      (currentData.financials.pharmacyFirstActivity !== undefined && 
       currentData.financials.pharmacyFirstActivity !== null)
    );
    
    if (hasFinancialsData) {
      return {
        fromPfsDetails: false,
        data: {
          basePayment: currentData.financials.pharmacyFirstBase || 0,
          activityPayment: currentData.financials.pharmacyFirstActivity || 0,
          totalPayment: (currentData.financials.pharmacyFirstBase || 0) + 
                         (currentData.financials.pharmacyFirstActivity || 0),
          treatmentItems: currentData.itemCounts?.nhsPfs || 0,
          consultations: 0,
          referrals: 0
        }
      };
    }
    
    if (currentData.itemCounts?.nhsPfs && currentData.itemCounts.nhsPfs > 0) {
      return {
        fromPfsDetails: false,
        data: {
          treatmentItems: currentData.itemCounts.nhsPfs,
          consultations: 0,
          referrals: 0,
          basePayment: 0,
          activityPayment: 0,
          totalPayment: 0
        }
      };
    }
    
    return null;
  };
  
  const getPreviousPfsData = () => {
    if (!previousData) return null;
    
    const hasPfsDetailsData = previousData.pfsDetails && 
      Object.values(previousData.pfsDetails).some(val => 
        val !== undefined && val !== null && val !== 0
      );
      
    if (hasPfsDetailsData) {
      return previousData.pfsDetails;
    }
    
    if (previousData.financials &&
        (previousData.financials.pharmacyFirstBase !== undefined ||
         previousData.financials.pharmacyFirstActivity !== undefined)) {
      return {
        basePayment: previousData.financials.pharmacyFirstBase || 0,
        activityPayment: previousData.financials.pharmacyFirstActivity || 0,
        totalPayment: (previousData.financials.pharmacyFirstBase || 0) + 
                      (previousData.financials.pharmacyFirstActivity || 0),
        treatmentItems: previousData.itemCounts?.nhsPfs || 0,
        consultations: 0,
        referrals: 0
      };
    }
    
    return null;
  };
  
  const pfsData = getPfsData();
  const previousPfsData = getPreviousPfsData();
  
  if (!pfsData) {
    console.log("No valid PFS data found");
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pharmacy First Details</h2>
          <p className="text-gray-500 italic">No Pharmacy First data available for this period.</p>
          <p className="text-sm text-gray-400 mt-2">
            Try enabling debug mode (Shift+D) in the Upload tab to diagnose extraction issues.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPercentChange = (current: number | undefined, previous: number | undefined) => {
    if (current === undefined || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const getTrendClass = (value: number | null): string => {
    if (value === null) return "";
    return value > 0 ? "text-emerald-600" : value < 0 ? "text-rose-600" : "";
  };

  const renderDetailRow = (label: string, value: any, previousValue?: any, isTotal: boolean = false) => {
    const formattedValue = typeof value === 'number' 
      ? (label.toLowerCase().includes('payment') || label.toLowerCase().includes('fee') 
        ? formatCurrency(value) 
        : value.toLocaleString())
      : value || '-';
      
    const percentChange = typeof value === 'number' && typeof previousValue === 'number' 
      ? getPercentChange(value, previousValue)
      : null;
    
    const trendClass = getTrendClass(percentChange);
    const warningClass = typeof value === 'number' && value === 0 ? "bg-amber-50" : "";
    
    const baseClasses = "grid grid-cols-2 py-1";
    const totalClasses = isTotal ? "mt-1 pt-1 border-t border-gray-200" : "";
    
    return (
      <div className={`${baseClasses} ${totalClasses} ${warningClass}`}>
        <div className={`text-sm ${isTotal ? "font-medium" : "text-gray-600"}`}>{label}</div>
        <div className={`text-sm ${isTotal ? "font-semibold" : "font-medium"} text-right flex items-center justify-end gap-1 ${trendClass}`}>
          {formattedValue}
          {percentChange !== null && (
            <>
              {percentChange > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : percentChange < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              <span className="text-xs">
                ({percentChange > 0 ? "+" : ""}{Math.abs(percentChange).toFixed(1)}%)
              </span>
            </>
          )}
          
          {typeof value === 'number' && value === 0 && previousValue && previousValue > 0 && (
            <span className="text-amber-600 text-xs ml-1">⚠️ dropped to zero</span>
          )}
        </div>
      </div>
    );
  };
  
  const data = pfsData.data;
  
  const treatmentItems = data?.treatmentItems ?? 0;
  const consultations = data?.consultations ?? 0;
  const referrals = data?.referrals ?? 0;
  const basePayment = data?.basePayment ?? 0;
  const activityPayment = data?.activityPayment ?? 0;
  const totalPayment = data?.totalPayment ?? (basePayment + activityPayment);
  
  const hasActivityData = treatmentItems > 0 || consultations > 0 || referrals > 0;
  const hasPaymentData = basePayment > 0 || activityPayment > 0 || totalPayment > 0;
  
  // Improved validation for supplementary payments
  const hasSupplementaryPayments = !!currentData?.supplementaryPayments && 
    typeof currentData.supplementaryPayments === 'object' &&
    !('_type' in currentData.supplementaryPayments) &&
    Array.isArray(currentData.supplementaryPayments.details) && 
    currentData.supplementaryPayments.details.length > 0;

  useEffect(() => {
    // Debug log for supplementary payments validation
    if (currentData?.supplementaryPayments) {
      console.log("Supplementary payments validation:", {
        isObject: typeof currentData.supplementaryPayments === 'object',
        hasNoTypeField: !('_type' in currentData.supplementaryPayments),
        hasDetailsArray: Array.isArray(currentData.supplementaryPayments.details),
        detailsLength: Array.isArray(currentData.supplementaryPayments.details) 
          ? currentData.supplementaryPayments.details.length 
          : 'not an array',
        showTable: hasSupplementaryPayments
      });
    }
  }, [currentData, hasSupplementaryPayments]);
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pharmacy First Details</h2>
        
        {!pfsData.fromPfsDetails && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            ℹ️ Limited data available - showing summary from financial records
          </div>
        )}
        
        <Accordion type="single" collapsible className="w-full" defaultValue="treatmentItems">
          {hasActivityData && (
            <AccordionItem value="treatmentItems" className="border-b">
              <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
                Treatment Items & Activity
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-1">
                {treatmentItems > 0 && renderDetailRow("Treatment Items", treatmentItems, previousPfsData?.treatmentItems)}
                {consultations > 0 && renderDetailRow("Consultations", consultations, previousPfsData?.consultations)}
                {referrals > 0 && renderDetailRow("Referrals", referrals, previousPfsData?.referrals)}
              </AccordionContent>
            </AccordionItem>
          )}
          
          {hasPaymentData && (
            <AccordionItem value="payments" className="border-b">
              <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
                Payments & Fees
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-1">
                {basePayment > 0 && renderDetailRow("Base Payment", basePayment, previousPfsData?.basePayment)}
                {activityPayment > 0 && renderDetailRow("Activity Payment", activityPayment, previousPfsData?.activityPayment)}
                {totalPayment > 0 && renderDetailRow("Total Payment", totalPayment, previousPfsData?.totalPayment, true)}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        
        {hasSupplementaryPayments && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Supplementary & Service Payments Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplementaryPaymentsTable payments={currentData.supplementaryPayments} />
            </CardContent>
          </Card>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          {pfsData.fromPfsDetails 
            ? "Data extracted from NHS PFS Payment Calculation sheet."
            : "Data extracted from payment summary records."}
          {" "}Month-on-month comparisons are shown where available.
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFirstDetails;

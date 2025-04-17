
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/documentUtils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PharmacyFirstDetailsProps {
  currentData: PaymentData | null;
  previousData?: PaymentData | null;
}

const PharmacyFirstDetails: React.FC<PharmacyFirstDetailsProps> = ({ currentData, previousData }) => {
  // Check if we have valid data with PFS details
  const hasPfsData = currentData && currentData.pfsDetails && 
    (currentData.pfsDetails.treatmentItems !== undefined || 
     currentData.pfsDetails.basePayment !== undefined ||
     currentData.pfsDetails.activityPayment !== undefined);
     
  // Log data for debugging
  console.log("PFS component - Current data:", currentData?.pfsDetails);
  console.log("PFS component - Previous data:", previousData?.pfsDetails);
  
  if (!hasPfsData) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pharmacy First Details</h2>
          <p className="text-gray-500 italic">No Pharmacy First data available for this period.</p>
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
  
  const hasSignificantActivityChanges = () => {
    if (!previousData?.pfsDetails) return false;
    
    const activityPayment = currentData.pfsDetails.activityPayment;
    const prevActivityPayment = previousData.pfsDetails.activityPayment;
    const treatmentItems = currentData.pfsDetails.treatmentItems;
    const prevTreatmentItems = previousData.pfsDetails.treatmentItems;
    
    // If activity payment dropped more than 15% while items are relatively stable
    if (activityPayment && prevActivityPayment && treatmentItems && prevTreatmentItems) {
      const paymentChange = getPercentChange(activityPayment, prevActivityPayment) || 0;
      const itemsChange = getPercentChange(treatmentItems, prevTreatmentItems) || 0;
      
      return paymentChange < -15 && itemsChange > -10;
    }
    
    return false;
  };
  
  const hasLowAppliedFee = () => {
    // Check if the ratio of activity payment to items is unusually low
    const appliedFee = currentData.pfsDetails?.appliedActivityFee;
    
    if (appliedFee !== undefined) {
      return appliedFee < 4.0; // Less than £4 threshold
    }
    
    // If we don't have applied fee, check if the ratio of activity payment to items is unusually low
    if (currentData.pfsDetails?.activityPayment && currentData.pfsDetails?.treatmentItems) {
      const averageFeePerItem = currentData.pfsDetails.activityPayment / currentData.pfsDetails.treatmentItems;
      return averageFeePerItem < 4.0; // Less than £4 per item threshold
    }
    
    return false;
  };
  
  // Make sure we have valid values or fallback to 0
  const treatmentItems = currentData.pfsDetails?.treatmentItems || 0;
  const consultations = currentData.pfsDetails?.consultations || 0;
  const referrals = currentData.pfsDetails?.referrals || 0;
  const weightedActivityTotal = currentData.pfsDetails?.weightedActivityTotal || 0;
  const basePayment = currentData.pfsDetails?.basePayment || 0;
  const activityPayment = currentData.pfsDetails?.activityPayment || 0;
  const totalPayment = currentData.pfsDetails?.totalPayment || basePayment + activityPayment;
  const appliedActivityFee = currentData.pfsDetails?.appliedActivityFee || 0;
  
  // UTI specific fields
  const utiTreatmentItems = currentData.pfsDetails?.utiTreatmentItems || 0;
  const utiConsultations = currentData.pfsDetails?.utiConsultations || 0;
  const utiReferrals = currentData.pfsDetails?.utiReferrals || 0;
  const utiTreatmentWeightedSubtotal = currentData.pfsDetails?.utiTreatmentWeightedSubtotal || 0;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pharmacy First Details</h2>
        
        {hasLowAppliedFee() && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            ⚠️ Applied activity fee is below £4 - this may impact your total payment
          </div>
        )}
        
        {hasSignificantActivityChanges() && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            ⚠️ Activity payment has decreased significantly while your item count remains stable
          </div>
        )}
        
        <Accordion type="single" collapsible className="w-full" defaultValue="treatmentItems">
          <AccordionItem value="treatmentItems" className="border-b">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
              Treatment Items & Activity
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {renderDetailRow("Treatment Items", treatmentItems, previousData?.pfsDetails?.treatmentItems)}
              {renderDetailRow("Consultations", consultations, previousData?.pfsDetails?.consultations)}
              {renderDetailRow("Referrals", referrals, previousData?.pfsDetails?.referrals)}
              
              {/* Show UTI fields if they exist */}
              {utiTreatmentItems > 0 && renderDetailRow("UTI Treatment Items", utiTreatmentItems, previousData?.pfsDetails?.utiTreatmentItems)}
              {utiConsultations > 0 && renderDetailRow("UTI Consultations", utiConsultations, previousData?.pfsDetails?.utiConsultations)}
              {utiReferrals > 0 && renderDetailRow("UTI Referrals", utiReferrals, previousData?.pfsDetails?.utiReferrals)}
              {utiTreatmentWeightedSubtotal > 0 && renderDetailRow("UTI Treatment Weighted", utiTreatmentWeightedSubtotal, previousData?.pfsDetails?.utiTreatmentWeightedSubtotal)}
              
              {renderDetailRow("Weighted Activity Total", weightedActivityTotal, previousData?.pfsDetails?.weightedActivityTotal, true)}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="payments" className="border-b">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
              Payments & Fees
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {appliedActivityFee > 0 && renderDetailRow("Applied Activity Fee", appliedActivityFee, previousData?.pfsDetails?.appliedActivityFee)}
              {renderDetailRow("Base Payment", basePayment, previousData?.pfsDetails?.basePayment)}
              {renderDetailRow("Activity Payment", activityPayment, previousData?.pfsDetails?.activityPayment)}
              {renderDetailRow("Total Payment", totalPayment, previousData?.pfsDetails?.totalPayment, true)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-4 text-xs text-gray-500">
          Data extracted from NHS PFS Payment Calculation sheet. Month-on-month comparisons are shown where available.
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFirstDetails;

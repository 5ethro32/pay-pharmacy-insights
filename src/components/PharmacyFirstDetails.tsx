import React, { useEffect } from "react";
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
  // For debugging
  useEffect(() => {
    if (currentData) {
      console.log("PharmacyFirstDetails - Current data:", currentData);
      console.log("PharmacyFirstDetails - PFS details:", currentData.pfsDetails);
      
      if (previousData) {
        console.log("PharmacyFirstDetails - Previous data:", previousData.pfsDetails);
      }
    }
  }, [currentData, previousData]);
  
  // Check more thoroughly if we have valid data with PFS details
  const hasPfsData = currentData && currentData.pfsDetails && 
    (Object.values(currentData.pfsDetails).some(val => 
      val !== undefined && val !== null && val !== 0
    ));
     
  if (!hasPfsData) {
    console.log("No valid PFS data found in:", currentData?.pfsDetails);
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
    // Check if the applied fee is unusually low
    const appliedFee = currentData.pfsDetails?.appliedActivityFee;
    
    if (appliedFee !== undefined) {
      return appliedFee < 4.0; // Less than £4 threshold
    }
    
    return false;
  };
  
  // Make sure we have valid values or fallback to 0
  const treatmentItems = currentData.pfsDetails?.treatmentItems ?? 0;
  const consultations = currentData.pfsDetails?.consultations ?? 0;
  const referrals = currentData.pfsDetails?.referrals ?? 0;
  const weightedActivityTotal = currentData.pfsDetails?.weightedActivityTotal ?? 0;
  const basePayment = currentData.pfsDetails?.basePayment ?? 0;
  const activityPayment = currentData.pfsDetails?.activityPayment ?? 0;
  const totalPayment = currentData.pfsDetails?.totalPayment ?? (basePayment + activityPayment);
  const appliedActivityFee = currentData.pfsDetails?.appliedActivityFee ?? 0;
  
  // UTI specific fields
  const utiTreatmentItems = currentData.pfsDetails?.utiTreatmentItems ?? 0;
  const utiConsultations = currentData.pfsDetails?.utiConsultations ?? 0;
  const utiReferrals = currentData.pfsDetails?.utiReferrals ?? 0;
  const utiTreatmentWeightedSubtotal = currentData.pfsDetails?.utiTreatmentWeightedSubtotal ?? 0;
  
  // Impetigo fields
  const impetigoTreatmentItems = currentData.pfsDetails?.impetigoTreatmentItems ?? 0;
  const impetigoConsultations = currentData.pfsDetails?.impetigoConsultations ?? 0;
  const impetigoReferrals = currentData.pfsDetails?.impetigoReferrals ?? 0;
  const impetigoTreatmentWeightedSubtotal = currentData.pfsDetails?.impetigoTreatmentWeightedSubtotal ?? 0;
  
  // Shingles fields
  const shinglesTreatmentItems = currentData.pfsDetails?.shinglesTreatmentItems ?? 0;
  const shinglesConsultations = currentData.pfsDetails?.shinglesConsultations ?? 0;
  const shinglesReferrals = currentData.pfsDetails?.shinglesReferrals ?? 0;
  const shinglesTreatmentWeightedSubtotal = currentData.pfsDetails?.shinglesTreatmentWeightedSubtotal ?? 0;
  
  // Skin Infection fields
  const skinInfectionItems = currentData.pfsDetails?.skinInfectionItems ?? 0;
  const skinInfectionConsultations = currentData.pfsDetails?.skinInfectionConsultations ?? 0;
  const skinInfectionReferrals = currentData.pfsDetails?.skinInfectionReferrals ?? 0;
  const skinInfectionWeightedSubtotal = currentData.pfsDetails?.skinInfectionWeightedSubtotal ?? 0;
  
  // Hayfever fields
  const hayfeverItems = currentData.pfsDetails?.hayfeverItems ?? 0;
  const hayfeverConsultations = currentData.pfsDetails?.hayfeverConsultations ?? 0;
  const hayfeverReferrals = currentData.pfsDetails?.hayfeverReferrals ?? 0;
  const hayfeverWeightedSubtotal = currentData.pfsDetails?.hayfeverWeightedSubtotal ?? 0;
  
  // Calculate an estimated total based on weights if not provided directly
  let calculatedWeightedTotal = 0;
  if (treatmentItems) calculatedWeightedTotal += treatmentItems;
  if (consultations) calculatedWeightedTotal += consultations;
  if (referrals) calculatedWeightedTotal += referrals;
  
  // Add special condition weighted totals
  if (utiTreatmentWeightedSubtotal) calculatedWeightedTotal += utiTreatmentWeightedSubtotal;
  if (impetigoTreatmentWeightedSubtotal) calculatedWeightedTotal += impetigoTreatmentWeightedSubtotal;
  if (shinglesTreatmentWeightedSubtotal) calculatedWeightedTotal += shinglesTreatmentWeightedSubtotal;
  if (skinInfectionWeightedSubtotal) calculatedWeightedTotal += skinInfectionWeightedSubtotal;
  if (hayfeverWeightedSubtotal) calculatedWeightedTotal += hayfeverWeightedSubtotal;
  
  // Use the calculated total if the extracted one is missing
  const displayedWeightedActivityTotal = weightedActivityTotal || calculatedWeightedTotal;
  
  // Group conditions for better organization
  const hasUtiData = utiTreatmentItems > 0 || utiConsultations > 0 || utiReferrals > 0;
  const hasImpetigoData = impetigoTreatmentItems > 0 || impetigoConsultations > 0 || impetigoReferrals > 0;
  const hasShinglesData = shinglesTreatmentItems > 0 || shinglesConsultations > 0 || shinglesReferrals > 0;
  const hasSkinInfectionData = skinInfectionItems > 0 || skinInfectionConsultations > 0 || skinInfectionReferrals > 0;
  const hasHayfeverData = hayfeverItems > 0 || hayfeverConsultations > 0 || hayfeverReferrals > 0;
  
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
        
        {(!basePayment || !totalPayment) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            ⚠️ Some payment data is missing - showing available metrics only
          </div>
        )}
        
        <Accordion type="single" collapsible className="w-full" defaultValue="treatmentItems">
          <AccordionItem value="treatmentItems" className="border-b">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
              Treatment Items & Activity
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {treatmentItems > 0 && renderDetailRow("Treatment Items", treatmentItems, previousData?.pfsDetails?.treatmentItems)}
              {consultations > 0 && renderDetailRow("Consultations", consultations, previousData?.pfsDetails?.consultations)}
              {referrals > 0 && renderDetailRow("Referrals", referrals, previousData?.pfsDetails?.referrals)}
              
              {/* Group UTI items */}
              {hasUtiData && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-800 mb-1">UTI</div>
                  {utiTreatmentItems > 0 && renderDetailRow("UTI Treatment Items", utiTreatmentItems, previousData?.pfsDetails?.utiTreatmentItems)}
                  {utiConsultations > 0 && renderDetailRow("UTI Consultations", utiConsultations, previousData?.pfsDetails?.utiConsultations)}
                  {utiReferrals > 0 && renderDetailRow("UTI Referrals", utiReferrals, previousData?.pfsDetails?.utiReferrals)}
                  {utiTreatmentWeightedSubtotal > 0 && renderDetailRow("UTI Treatment Weighted", utiTreatmentWeightedSubtotal, previousData?.pfsDetails?.utiTreatmentWeightedSubtotal)}
                </div>
              )}
              
              {/* Group Impetigo items */}
              {hasImpetigoData && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-800 mb-1">Impetigo</div>
                  {impetigoTreatmentItems > 0 && renderDetailRow("Impetigo Treatment Items", impetigoTreatmentItems, previousData?.pfsDetails?.impetigoTreatmentItems)}
                  {impetigoConsultations > 0 && renderDetailRow("Impetigo Consultations", impetigoConsultations, previousData?.pfsDetails?.impetigoConsultations)}
                  {impetigoReferrals > 0 && renderDetailRow("Impetigo Referrals", impetigoReferrals, previousData?.pfsDetails?.impetigoReferrals)}
                  {impetigoTreatmentWeightedSubtotal > 0 && renderDetailRow("Impetigo Treatment Weighted", impetigoTreatmentWeightedSubtotal, previousData?.pfsDetails?.impetigoTreatmentWeightedSubtotal)}
                </div>
              )}
              
              {/* Group Shingles items */}
              {hasShinglesData && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-800 mb-1">Shingles</div>
                  {shinglesTreatmentItems > 0 && renderDetailRow("Shingles Treatment Items", shinglesTreatmentItems, previousData?.pfsDetails?.shinglesTreatmentItems)}
                  {shinglesConsultations > 0 && renderDetailRow("Shingles Consultations", shinglesConsultations, previousData?.pfsDetails?.shinglesConsultations)}
                  {shinglesReferrals > 0 && renderDetailRow("Shingles Referrals", shinglesReferrals, previousData?.pfsDetails?.shinglesReferrals)}
                  {shinglesTreatmentWeightedSubtotal > 0 && renderDetailRow("Shingles Treatment Weighted", shinglesTreatmentWeightedSubtotal, previousData?.pfsDetails?.shinglesTreatmentWeightedSubtotal)}
                </div>
              )}
              
              {/* Group Skin Infection items */}
              {hasSkinInfectionData && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-800 mb-1">Skin Infection</div>
                  {skinInfectionItems > 0 && renderDetailRow("Skin Infection Items", skinInfectionItems, previousData?.pfsDetails?.skinInfectionItems)}
                  {skinInfectionConsultations > 0 && renderDetailRow("Skin Infection Consultations", skinInfectionConsultations, previousData?.pfsDetails?.skinInfectionConsultations)}
                  {skinInfectionReferrals > 0 && renderDetailRow("Skin Infection Referrals", skinInfectionReferrals, previousData?.pfsDetails?.skinInfectionReferrals)}
                  {skinInfectionWeightedSubtotal > 0 && renderDetailRow("Skin Infection Weighted", skinInfectionWeightedSubtotal, previousData?.pfsDetails?.skinInfectionWeightedSubtotal)}
                </div>
              )}
              
              {/* Group Hayfever items */}
              {hasHayfeverData && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-800 mb-1">Hayfever</div>
                  {hayfeverItems > 0 && renderDetailRow("Hayfever Items", hayfeverItems, previousData?.pfsDetails?.hayfeverItems)}
                  {hayfeverConsultations > 0 && renderDetailRow("Hayfever Consultations", hayfeverConsultations, previousData?.pfsDetails?.hayfeverConsultations)}
                  {hayfeverReferrals > 0 && renderDetailRow("Hayfever Referrals", hayfeverReferrals, previousData?.pfsDetails?.hayfeverReferrals)}
                  {hayfeverWeightedSubtotal > 0 && renderDetailRow("Hayfever Weighted", hayfeverWeightedSubtotal, previousData?.pfsDetails?.hayfeverWeightedSubtotal)}
                </div>
              )}
              
              {displayedWeightedActivityTotal > 0 && renderDetailRow("Weighted Activity Total", displayedWeightedActivityTotal, previousData?.pfsDetails?.weightedActivityTotal, true)}
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="payments" className="border-b">
            <AccordionTrigger className="py-3 text-base font-medium hover:no-underline">
              Payments & Fees
            </AccordionTrigger>
            <AccordionContent className="pb-3 space-y-1">
              {appliedActivityFee > 0 && renderDetailRow("Applied Activity Fee", appliedActivityFee, previousData?.pfsDetails?.appliedActivityFee)}
              {basePayment > 0 && renderDetailRow("Base Payment", basePayment, previousData?.pfsDetails?.basePayment)}
              {activityPayment > 0 && renderDetailRow("Activity Payment", activityPayment, previousData?.pfsDetails?.activityPayment)}
              {totalPayment > 0 && renderDetailRow("Total Payment", totalPayment, previousData?.pfsDetails?.totalPayment, true)}
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

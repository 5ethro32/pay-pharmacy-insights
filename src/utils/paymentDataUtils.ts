
import { PaymentData } from "@/types/paymentTypes";

// Transform document data from Supabase to PaymentData format
export const transformDocumentToPaymentData = (document: any): PaymentData => {
  const data = document.extracted_data || {};
  
  // Make sure month is properly formatted
  const month = data.month ? data.month.charAt(0).toUpperCase() + data.month.slice(1).toLowerCase() : "";
  
  // Basic payment data
  const paymentData: PaymentData = {
    id: document.id || "",
    month: month,
    year: data.year || new Date().getFullYear(),
    totalItems: data.itemCounts?.total || 0,
    netPayment: data.netPayment || 0,
    contractorCode: data.contractorCode || "",
    dispensingMonth: data.dispensingMonth || "",
    
    // Item counts
    itemCounts: {
      total: data.itemCounts?.total || 0,
      ams: data.itemCounts?.ams || 0,
      mcr: data.itemCounts?.mcr || 0,
      nhsPfs: data.itemCounts?.nhsPfs || 0,
      cpus: data.itemCounts?.cpus || 0,
      other: data.itemCounts?.other || 0
    },
    
    // Financial data
    financials: {
      grossIngredientCost: data.financials?.grossIngredientCost || 0,
      netIngredientCost: data.financials?.netIngredientCost || 0, 
      dispensingPool: data.financials?.dispensingPool || 0,
      establishmentPayment: data.financials?.establishmentPayment || 0,
      pharmacyFirstBase: data.financials?.pharmacyFirstBase || 0,
      pharmacyFirstActivity: data.financials?.pharmacyFirstActivity || 0,
      averageGrossValue: data.financials?.averageGrossValue || 0,
      supplementaryPayments: data.financials?.supplementaryPayments || 0
    },
    
    // Advance payments
    advancePayments: {
      previousMonth: data.advancePayments?.previousMonth || 0,
      nextMonth: data.advancePayments?.nextMonth || 0
    },
    
    // Service costs
    serviceCosts: data.serviceCosts || {},
    
    // PFS details - ensure we get all available fields
    pfsDetails: {
      // Standard PFS fields
      treatmentItems: data.pfsDetails?.treatmentItems || 0,
      treatmentWeighting: data.pfsDetails?.treatmentWeighting || 0,
      treatmentWeightedSubtotal: data.pfsDetails?.treatmentWeightedSubtotal || 0,
      
      consultations: data.pfsDetails?.consultations || 0,
      consultationWeighting: data.pfsDetails?.consultationWeighting || 0,
      consultationsWeightedSubtotal: data.pfsDetails?.consultationsWeightedSubtotal || 0,
      
      referrals: data.pfsDetails?.referrals || 0,
      referralWeighting: data.pfsDetails?.referralWeighting || 0,
      referralsWeightedSubtotal: data.pfsDetails?.referralsWeightedSubtotal || 0,
      
      // UTI specific fields
      utiTreatmentItems: data.pfsDetails?.utiTreatmentItems || 0,
      utiTreatmentWeighting: data.pfsDetails?.utiTreatmentWeighting || 0,
      utiTreatmentWeightedSubtotal: data.pfsDetails?.utiTreatmentWeightedSubtotal || 0,
      
      utiConsultations: data.pfsDetails?.utiConsultations || 0,
      utiConsultationWeighting: data.pfsDetails?.utiConsultationWeighting || 0,
      utiConsultationsWeightedSubtotal: data.pfsDetails?.utiConsultationsWeightedSubtotal || 0,
      
      utiReferrals: data.pfsDetails?.utiReferrals || 0,
      utiReferralWeighting: data.pfsDetails?.utiReferralWeighting || 0,
      utiReferralsWeightedSubtotal: data.pfsDetails?.utiReferralsWeightedSubtotal || 0,
      
      // Activity totals and payment details
      weightedActivityTotal: data.pfsDetails?.weightedActivityTotal || 0,
      activitySpecifiedMinimum: data.pfsDetails?.activitySpecifiedMinimum || 0,
      weightedActivityAboveMinimum: data.pfsDetails?.weightedActivityAboveMinimum || 0,
      nationalActivityAboveMinimum: data.pfsDetails?.nationalActivityAboveMinimum || 0,
      monthlyPool: data.pfsDetails?.monthlyPool || 0,
      appliedActivityFee: data.pfsDetails?.appliedActivityFee || 0,
      maximumActivityFee: data.pfsDetails?.maximumActivityFee || 0,
      basePayment: data.pfsDetails?.basePayment || 0,
      activityPayment: data.pfsDetails?.activityPayment || 0,
      totalPayment: data.pfsDetails?.totalPayment || 0
    },
    
    // Include regional payments if available
    regionalPayments: data.regionalPayments || null
  };
  
  return paymentData;
};

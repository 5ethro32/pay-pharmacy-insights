export interface PaymentData {
  id: string;
  month: string;
  year: number;
  totalItems: number;
  netPayment: number;
  contractorCode?: string;
  dispensingMonth?: string;
  itemCounts?: {
    total: number;
    ams?: number;
    mcr?: number;
    nhsPfs?: number;
    cpus?: number;
    other?: number;
  };
  financials?: {
    grossIngredientCost?: number;
    netIngredientCost?: number;
    dispensingPool?: number;
    establishmentPayment?: number;
    pharmacyFirstBase?: number;
    pharmacyFirstActivity?: number;
    averageGrossValue?: number;
    supplementaryPayments?: number;
    outOfPocket?: number;
    advancePaymentMade?: number;
    advancePaymentNext?: number;
    feesAllowances?: number;
    deductions?: number;
    serviceCosts?: {
      ams?: number;
      mcr?: number;
      nhsPfs?: number;
      cpus?: number;
      other?: number;
    };
  };
  advancePayments?: {
    previousMonth?: number;
    nextMonth?: number;
  };
  serviceCosts?: {
    ams?: number;
    mcr?: number;
    nhsPfs?: number;
    cpus?: number;
    other?: number;
  };
  pfsDetails?: PFSDetails;
  regionalPayments?: {
    paymentDetails: Array<{
      description: string;
      amount: number;
    }>;
    totalAmount: number;
  };
  extracted_data?: {
    contractorCode?: string;
    month?: string;
    year?: number;
    totalItems?: number;
    itemCounts?: {
      total: number;
      ams?: number;
      mcr?: number;
      nhsPfs?: number;
      cpus?: number;
      other?: number;
    };
    financials?: {
      netIngredientCost?: number;
      feesAllowances?: number;
      deductions?: number;
    };
  };
}

export interface PFSDetails {
  treatmentItems?: number;
  treatmentWeighting?: number;
  treatmentWeightedSubtotal?: number;
  consultations?: number;
  consultationWeighting?: number;
  consultationsWeightedSubtotal?: number;
  referrals?: number;
  referralWeighting?: number;
  referralsWeightedSubtotal?: number;
  
  // UTI specific fields
  utiTreatmentItems?: number;
  utiTreatmentWeighting?: number;
  utiTreatmentWeightedSubtotal?: number;
  utiConsultations?: number;
  utiConsultationWeighting?: number;
  utiConsultationsWeightedSubtotal?: number;
  utiReferrals?: number;
  utiReferralWeighting?: number;
  utiReferralsWeightedSubtotal?: number;
  
  // Impetigo specific fields
  impetigoTreatmentItems?: number;
  impetigoTreatmentWeighting?: number;
  impetigoTreatmentWeightedSubtotal?: number;
  impetigoConsultations?: number;
  impetigoConsultationWeighting?: number;
  impetigoConsultationsWeightedSubtotal?: number;
  impetigoReferrals?: number;
  impetigoReferralWeighting?: number;
  impetigoReferralsWeightedSubtotal?: number;
  
  // Shingles specific fields
  shinglesTreatmentItems?: number;
  shinglesTreatmentWeighting?: number;
  shinglesTreatmentWeightedSubtotal?: number;
  shinglesConsultations?: number;
  shinglesConsultationWeighting?: number;
  shinglesConsultationsWeightedSubtotal?: number;
  shinglesReferrals?: number;
  shinglesReferralWeighting?: number;
  shinglesReferralsWeightedSubtotal?: number;
  
  // Skin Infection specific fields
  skinInfectionItems?: number;
  skinInfectionWeighting?: number;
  skinInfectionWeightedSubtotal?: number;
  skinInfectionConsultations?: number;
  skinInfectionConsultationWeighting?: number;
  skinInfectionConsultationsWeightedSubtotal?: number;
  skinInfectionReferrals?: number;
  skinInfectionReferralWeighting?: number;
  skinInfectionReferralsWeightedSubtotal?: number;
  
  // Hayfever specific fields
  hayfeverItems?: number;
  hayfeverWeighting?: number;
  hayfeverWeightedSubtotal?: number;
  hayfeverConsultations?: number;
  hayfeverConsultationWeighting?: number;
  hayfeverConsultationsWeightedSubtotal?: number;
  hayfeverReferrals?: number;
  hayfeverReferralWeighting?: number;
  hayfeverReferralsWeightedSubtotal?: number;
  
  // Activity and payment fields
  weightedActivityTotal?: number;
  activitySpecifiedMinimum?: number;
  weightedActivityAboveMinimum?: number;
  nationalActivityAboveMinimum?: number;
  monthlyPool?: number;
  appliedActivityFee?: number;
  maximumActivityFee?: number;
  basePayment?: number;
  basePaymentAdjustmentCode?: string;
  activityPayment?: number;
  activityPaymentAdjustmentCode?: string;
  totalPayment?: number;
}

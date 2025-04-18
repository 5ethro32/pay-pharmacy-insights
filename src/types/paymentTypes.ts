
export interface ItemCounts {
  total?: number;
  otc?: number;
  prescriptions?: number;
  appliance?: number;
  extemp?: number;
  invoiceTotal?: number;
  exemptTotal?: number;
  privateTotal?: number;
  fp10Total?: number;
  pnTotal?: number;
  wpTotal?: number;
  totalValue?: number;
  mcr?: number;
  ams?: number;
  nhsPfs?: number;
  cpus?: number;
  other?: number;
}

export interface Financials {
  grossIngredientCost?: number;
  netIngredientCost?: number;
  feesAllowances?: number;
  deductions?: number;
  netPayment?: number;
  vatTotal?: number;
  totalCost?: number;
  totalIncome?: number;
  grossProfit?: number;
  netProfit?: number;
  taxPayable?: number;
  retainedEarnings?: number;
  netAssets?: number;
  pharmacyFirstBase?: number;
  pharmacyFirstActivity?: number;
  averageGrossValue?: number;
  supplementaryPayments?: number;
  dispensingPool?: number;
  establishmentPayment?: number;
}

export interface RegionalPayments {
  totalAmount?: number;
  details?: {
    [key: string]: number;
  };
  paymentDetails?: { 
    description: string; 
    amount: number;
  }[];
}

export interface PFSDetails {
  treatmentItems?: number;
  consultations?: number;
  referrals?: number;
  treatmentWeighting?: number;
  treatmentWeightedSubtotal?: number;
  consultationWeighting?: number;
  consultationsWeightedSubtotal?: number;
  referralWeighting?: number;
  referralsWeightedSubtotal?: number;
  
  utiTreatmentItems?: number;
  utiConsultations?: number;
  utiReferrals?: number;
  utiTreatmentWeighting?: number;
  utiTreatmentWeightedSubtotal?: number;
  utiConsultationWeighting?: number;
  utiConsultationsWeightedSubtotal?: number;
  utiReferralWeighting?: number;
  utiReferralsWeightedSubtotal?: number;
  
  impetigoTreatmentItems?: number;
  impetigoConsultations?: number;
  impetigoReferrals?: number;
  impetigoTreatmentWeighting?: number;
  impetigoTreatmentWeightedSubtotal?: number;
  impetigoConsultationWeighting?: number;
  impetigoConsultationsWeightedSubtotal?: number;
  impetigoReferralWeighting?: number;
  impetigoReferralsWeightedSubtotal?: number;
  
  shinglesTreatmentItems?: number;
  shinglesConsultations?: number;
  shinglesReferrals?: number;
  shinglesTreatmentWeighting?: number;
  shinglesTreatmentWeightedSubtotal?: number;
  shinglesConsultationWeighting?: number;
  shinglesConsultationsWeightedSubtotal?: number;
  shinglesReferralWeighting?: number;
  shinglesReferralsWeightedSubtotal?: number;
  
  skinInfectionItems?: number;
  skinInfectionConsultations?: number;
  skinInfectionReferrals?: number;
  skinInfectionWeighting?: number;
  skinInfectionWeightedSubtotal?: number;
  skinInfectionConsultationWeighting?: number;
  skinInfectionConsultationsWeightedSubtotal?: number;
  skinInfectionReferralWeighting?: number;
  skinInfectionReferralsWeightedSubtotal?: number;
  
  hayfeverItems?: number;
  hayfeverConsultations?: number;
  hayfeverReferrals?: number;
  hayfeverWeighting?: number;
  hayfeverWeightedSubtotal?: number;
  hayfeverConsultationWeighting?: number;
  hayfeverConsultationsWeightedSubtotal?: number;
  hayfeverReferralWeighting?: number;
  hayfeverReferralsWeightedSubtotal?: number;
  
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

export interface SupplementaryPaymentDetail {
  code: string;
  amount: number;
}

export interface PaymentData {
  id: string;
  month: string;
  year: number;
  totalItems: number;
  netPayment: number;
  averageItemValue?: number;
  itemCounts?: ItemCounts;
  financials?: Financials;
  regionalPayments?: RegionalPayments;
  contractorCode?: string;
  dispensingMonth?: string;
  healthBoard?: string;
  pfsDetails?: PFSDetails;
  extracted_data?: any;
  supplementaryPayments?: {
    details?: SupplementaryPaymentDetail[];
    total?: number;
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
}

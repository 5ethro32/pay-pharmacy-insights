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
}

export interface RegionalPayments {
  totalAmount?: number;
  details?: {
    [key: string]: number;
  };
}

interface PFSDetails {
  treatmentItems?: number;
  consultations?: number;
  referrals?: number;
  utiTreatmentItems?: number;
  utiConsultations?: number;
  utiReferrals?: number;
  utiTreatmentWeighted?: number;
  impetigoTreatmentItems?: number;
  impetigoTreatmentWeighted?: number;
  shinglesTreatmentItems?: number;
  shinglesTreatmentWeighted?: number;
  skinInfectionItems?: number;
  skinInfectionConsultations?: number;
  skinInfectionWeighted?: number;
  hayfeverItems?: number;
  hayfeverWeighted?: number;
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
  pfsDetails?: PFSDetails;
  extracted_data?: any;
  supplementaryPayments?: any;
}

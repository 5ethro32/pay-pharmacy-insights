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
  pfsDetails?: {
    treatmentItems?: number;
    treatmentWeighting?: number;
    treatmentWeightedSubtotal?: number;
    consultations?: number;
    consultationWeighting?: number;
    consultationsWeightedSubtotal?: number;
    referrals?: number;
    referralWeighting?: number;
    referralsWeightedSubtotal?: number;
    weightedActivityTotal?: number;
    activitySpecifiedMinimum?: number;
    weightedActivityAboveMinimum?: number;
    nationalActivityAboveMinimum?: number;
    monthlyPool?: number;
    appliedActivityFee?: number;
    maximumActivityFee?: number;
    basePayment?: number;
    activityPayment?: number;
    totalPayment?: number;
  };
  regionalPayments?: {
    paymentDetails: Array<{
      description: string;
      amount: number;
    }>;
    totalAmount: number;
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
  weightedActivityTotal?: number;
  activitySpecifiedMinimum?: number;
  weightedActivityAboveMinimum?: number;
  nationalActivityAboveMinimum?: number;
  monthlyPool?: number;
  appliedActivityFee?: number;
  maximumActivityFee?: number;
  basePayment?: number;
  activityPayment?: number;
  totalPayment?: number;
}

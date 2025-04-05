
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
    consultations?: number;
    referrals?: number;
    weightedActivityTotal?: number;
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

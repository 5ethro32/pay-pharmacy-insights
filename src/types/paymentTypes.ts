export interface HighValueItem {
  description: string;
  formStrength: string;
  quantity: number;
  price: number;
  date: string | null;
}

export interface HighValueItemsData {
  items: HighValueItem[];
  totalValue: number;
  itemCount: number;
}

export interface ProcessingError {
  description: string;
  originalPaid: number;
  shouldHavePaid: number;
  adjustment: number;
}

export interface ProcessingErrorsData {
  errors: ProcessingError[];
  netAdjustment: number;
  errorCount: number;
}

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
    paymentDetails: {
      description: string;
      amount: number;
    }[];
    totalAmount: number;
  };
  highValueItems?: HighValueItemsData;
  processingErrors?: ProcessingErrorsData;
}

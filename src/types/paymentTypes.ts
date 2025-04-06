
// Type definitions for payment data structures
export interface HighValueItem {
  description: string;
  formStrength: string;
  quantity: number;
  price: number;
  date: string | null;
}

export interface ProcessingError {
  description: string;
  originalPaid: number;
  shouldHavePaid: number;
  adjustment: number;
}

export interface HighValueItemsData {
  items: HighValueItem[];
  totalValue: number;
  itemCount: number;
}

export interface ProcessingErrorsData {
  errors: ProcessingError[];
  netAdjustment: number;
  errorCount: number;
}

export interface ItemCounts {
  total: number;
  ams: number;
  mcr: number;
  nhsPfs: number;
  cpus: number;
  other: number;
}

export interface Financials {
  grossIngredientCost: number;
  netIngredientCost: number;
  dispensingPool: number;
  establishmentPayment: number;
  pharmacyFirstBase: number;
  pharmacyFirstActivity: number;
  supplementaryPayments: number;
  averageGrossValue?: number;
}

export interface PaymentData {
  id: string;
  month: string;
  year: number;
  dispensingMonth?: string;
  contractorCode: string;
  totalItems: number;
  netPayment: number;
  itemCounts?: ItemCounts;
  financials?: Financials;
  highValueItems?: HighValueItemsData;
  processingErrors?: ProcessingErrorsData;
}

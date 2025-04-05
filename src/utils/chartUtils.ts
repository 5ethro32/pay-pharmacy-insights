
import { PaymentData } from "@/types/paymentTypes";

// Get the month index (0-11) for a month name
export const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
};

// Calculate margin percentage
export const calculateMarginPercent = (doc: PaymentData): number | undefined => {
  const netPayment = doc.netPayment;
  const grossIngredientCost = doc.financials?.grossIngredientCost;
  
  if (netPayment !== undefined && grossIngredientCost !== undefined && grossIngredientCost !== 0) {
    return ((netPayment - grossIngredientCost) / grossIngredientCost) * 100;
  }
  return undefined;
};

// Calculate Y-axis domain with padding
export const calculateDomain = (values: number[]): [number, number] => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const padding = (max - min) * 0.1;
  const lowerBound = Math.max(0, min - padding);
  
  return [lowerBound, Math.ceil(max + padding)];
};

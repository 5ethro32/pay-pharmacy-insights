import { PaymentData } from "@/types/paymentTypes";

// Get the month index (0-11) for a month name
export const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Handle uppercase month names (normalize input)
  const normalizedName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
  const index = months.indexOf(normalizedName);
  
  // If not found, try with all uppercase
  if (index === -1) {
    for (let i = 0; i < months.length; i++) {
      if (months[i].toUpperCase() === monthName.toUpperCase()) {
        return i;
      }
    }
    // If still not found, log an error and return 0 (January)
    console.error(`Invalid month name: ${monthName}`);
    return 0;
  }
  
  return index;
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
  if (!values.length) return [0, 100]; // Default domain if no values
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  // Handle case where all values are the same (flat line)
  if (range === 0) {
    // If the value is 0, use [0, 10] as domain
    if (min === 0) return [0, 10];
    
    // Otherwise create a domain centered around the single value
    // with padding of 10% of the value
    const padding = Math.abs(min) * 0.1;
    return [
      Math.max(0, min - padding), // Never go below 0 for financial metrics
      max + padding
    ];
  }
  
  // For normal ranges, use padding based on the range itself
  // Use more padding (20%) for narrower ranges, less (10%) for wider ranges
  const paddingFactor = range < (max * 0.2) ? 0.2 : 0.1;
  const padding = range * paddingFactor;
  
  // Ensure we don't go below zero for financial data
  const lowerBound = Math.max(0, min - padding);
  
  return [lowerBound, Math.ceil(max + padding)];
};

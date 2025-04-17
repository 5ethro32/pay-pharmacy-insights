/**
 * Utility functions for document manipulation
 */

/**
 * Downloads a file from a URL or blob
 * @param data Blob or URL data to download
 * @param filename The name to give the downloaded file
 */
export function downloadFile(data: Blob, filename: string): void {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Format file size in bytes to a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Format a value as currency (GBP)
 */
export const formatCurrency = (amount: number | string): string => {
  // If the value is not a number, try to parse it
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if the value is a valid number
  if (isNaN(value)) {
    return '£0.00';
  }
  
  // Format the value as currency
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Parse a string containing a currency value and convert it to a number
 * @param value The value to parse (e.g. "£1,234.56")
 * @returns The parsed numeric value or null if invalid
 */
export function parseCurrencyValue(value: any): number | null {
  if (value === null || value === undefined) return null;
  
  // If already a number, return it
  if (typeof value === 'number') return value;
  
  // Handle string format with currency symbols (£1,234.56)
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[£$€,\s]/g, '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

/**
 * Extract year from a month string (e.g. "JANUARY 2025")
 * @param monthString The month string possibly containing a year
 * @returns The extracted year as a number, or current year if not found
 */
export function extractYearFromMonthString(monthString: string | null | undefined): number {
  if (!monthString) return new Date().getFullYear();
  
  // Try to parse a year from the string (looking for 4-digit number)
  const yearMatch = monthString.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0], 10);
  }
  
  // If no year is found in the string, handle month-specific defaults
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11
  
  // Get the month from the string (case insensitive)
  const monthNames = ["january", "february", "march", "april", "may", "june",
                     "july", "august", "september", "october", "november", "december"];
  
  const monthNameInString = monthNames.find(m => 
    monthString.toLowerCase().includes(m.toLowerCase())
  );
  
  if (monthNameInString) {
    const monthIndex = monthNames.indexOf(monthNameInString);
    
    // If the month in the string is after the current month,
    // it's likely from the previous year
    if (monthIndex > currentMonth) {
      return currentYear - 1;
    }
  }
  
  // Default to current year if we can't determine otherwise
  return currentYear;
}

/**
 * Safely access nested properties that might exist in either format
 */
const safeGet = (data: any, path: string[], defaultValue: any = undefined) => {
  if (!data) return defaultValue;
  
  let current = data;
  for (const key of path) {
    if (current === undefined || current === null) return defaultValue;
    current = current[key];
  }
  
  return current !== undefined && current !== null ? current : defaultValue;
};

/**
 * Explain payment variance between two payment periods
 * @param currentMonthData The current month payment data
 * @param previousMonthData The previous month payment data
 * @returns Object containing explanation of payment variance
 */
export const explainPaymentVariance = (currentMonthData: any, previousMonthData: any) => {
  if (!currentMonthData || !previousMonthData) return null;
  
  // Extract payment values from both months - handle both old and new formats
  const netPaymentCurrent = safeGet(currentMonthData, ['netPayment'], 0);
  const netPaymentPrevious = safeGet(previousMonthData, ['netPayment'], 0);
  
  const totalDifference = netPaymentCurrent - netPaymentPrevious;
  const percentChange = netPaymentPrevious !== 0 ? (totalDifference / netPaymentPrevious) * 100 : 0;
  
  // Initialize variance explanation
  const explanation: any = {
    totalDifference,
    percentChange,
    currentAmount: netPaymentCurrent,
    previousAmount: netPaymentPrevious,
    components: [],
    primaryFactor: null,
    regionalPaymentDetails: []
  };
  
  // Compare regional payments if available
  const currentRegionalPayments = safeGet(currentMonthData, ['regionalPayments'], null);
  const previousRegionalPayments = safeGet(previousMonthData, ['regionalPayments'], null);
  
  if (currentRegionalPayments && previousRegionalPayments) {
    const regionalCurrent = safeGet(currentRegionalPayments, ['totalAmount'], 0);
    const regionalPrevious = safeGet(previousRegionalPayments, ['totalAmount'], 0);
    const regionalDiff = regionalCurrent - regionalPrevious;
    
    const contribution = totalDifference !== 0 ? (regionalDiff / totalDifference) * 100 : 0;
    
    explanation.components.push({
      name: "Regional Payments",
      previous: regionalPrevious,
      current: regionalCurrent,
      difference: regionalDiff,
      contribution: contribution
    });
    
    // Analyze individual regional payments for significant changes
    const allPaymentDescriptions = new Set<string>();
    
    if (safeGet(previousRegionalPayments, ['paymentDetails'], null)) {
      previousRegionalPayments.paymentDetails.forEach((item: any) => 
        allPaymentDescriptions.add(item.description));
    }
    
    if (safeGet(currentRegionalPayments, ['paymentDetails'], null)) {
      currentRegionalPayments.paymentDetails.forEach((item: any) => 
        allPaymentDescriptions.add(item.description));
    }
    
    const individualPaymentChanges: any[] = [];
    
    allPaymentDescriptions.forEach(desc => {
      const prevPayment = previousRegionalPayments.paymentDetails?.find(
        (p: any) => p.description === desc
      );
      const currPayment = currentRegionalPayments.paymentDetails?.find(
        (p: any) => p.description === desc
      );
      
      const prevAmount = prevPayment ? prevPayment.amount : 0;
      const currAmount = currPayment ? currPayment.amount : 0;
      const paymentDiff = currAmount - prevAmount;
      
      // Only track significant changes (over £100 or completely added/removed)
      if (Math.abs(paymentDiff) > 100 || 
          (prevAmount === 0 && currAmount > 0) || 
          (prevAmount > 0 && currAmount === 0)) {
        
        individualPaymentChanges.push({
          description: desc,
          previous: prevAmount,
          current: currAmount,
          difference: paymentDiff,
          contribution: totalDifference !== 0 ? (paymentDiff / totalDifference) * 100 : 0,
          isOneTime: (prevAmount > 0 && currAmount === 0) || (prevAmount === 0 && currAmount > 0)
        });
      }
    });
    
    // Sort by absolute contribution
    individualPaymentChanges.sort((a, b) => 
      Math.abs(b.contribution) - Math.abs(a.contribution));
    
    explanation.regionalPaymentDetails = individualPaymentChanges;
  }
  
  // Compare other financial components
  const currentFinancials = safeGet(currentMonthData, ['financials'], null);
  const previousFinancials = safeGet(previousMonthData, ['financials'], null);
  
  if (currentFinancials && previousFinancials) {
    // Compare gross ingredient cost
    const gicCurrent = safeGet(currentFinancials, ['grossIngredientCost'], 0);
    const gicPrevious = safeGet(previousFinancials, ['grossIngredientCost'], 0);
    const gicDiff = gicCurrent - gicPrevious;
    
    explanation.components.push({
      name: "Gross Ingredient Cost",
      previous: gicPrevious,
      current: gicCurrent,
      difference: gicDiff,
      contribution: totalDifference !== 0 ? (gicDiff / totalDifference) * 100 : 0
    });
    
    // Compare supplementary payments
    const suppCurrent = safeGet(currentFinancials, ['supplementaryPayments'], 0);
    const suppPrevious = safeGet(previousFinancials, ['supplementaryPayments'], 0);
    const suppDiff = suppCurrent - suppPrevious;
    
    explanation.components.push({
      name: "Supplementary Payments",
      previous: suppPrevious,
      current: suppCurrent,
      difference: suppDiff,
      contribution: totalDifference !== 0 ? (suppDiff / totalDifference) * 100 : 0
    });
    
    // Compare pharmacy first payments
    if (safeGet(currentFinancials, ['pharmacyFirstBase'], undefined) !== undefined || 
        safeGet(previousFinancials, ['pharmacyFirstBase'], undefined) !== undefined) {
      const pfCurrent = safeGet(currentFinancials, ['pharmacyFirstBase'], 0) + 
                        safeGet(currentFinancials, ['pharmacyFirstActivity'], 0);
      const pfPrevious = safeGet(previousFinancials, ['pharmacyFirstBase'], 0) + 
                         safeGet(previousFinancials, ['pharmacyFirstActivity'], 0);
      const pfDiff = pfCurrent - pfPrevious;
      
      explanation.components.push({
        name: "Pharmacy First",
        previous: pfPrevious,
        current: pfCurrent,
        difference: pfDiff,
        contribution: totalDifference !== 0 ? (pfDiff / totalDifference) * 100 : 0
      });
    }
  }
  
  // Determine primary factor
  if (explanation.components.length > 0) {
    explanation.components.sort((a: any, b: any) => 
      Math.abs(b.contribution) - Math.abs(a.contribution));
    
    explanation.primaryFactor = explanation.components[0];
  } else if (explanation.regionalPaymentDetails.length > 0) {
    explanation.primaryFactor = {
      name: explanation.regionalPaymentDetails[0].description,
      previous: explanation.regionalPaymentDetails[0].previous,
      current: explanation.regionalPaymentDetails[0].current,
      difference: explanation.regionalPaymentDetails[0].difference,
      contribution: explanation.regionalPaymentDetails[0].contribution
    };
  }
  
  return explanation;
};

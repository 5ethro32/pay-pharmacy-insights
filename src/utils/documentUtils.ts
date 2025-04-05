
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
export function formatCurrency(value: any): string {
  if (!value && value !== 0) return '£0.00';
  
  // Remove currency symbol if present
  let numericValue = value;
  if (typeof value === 'string') {
    numericValue = value.replace(/[£$,]/g, '');
  }
  
  // Convert to number and format
  const number = parseFloat(numericValue);
  if (isNaN(number)) return value;
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(number);
}

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
 * Explain payment variance between two payment periods
 * @param currentMonthData The current month payment data
 * @param previousMonthData The previous month payment data
 * @returns Object containing explanation of payment variance
 */
export function explainPaymentVariance(currentMonthData: any, previousMonthData: any) {
  if (!currentMonthData || !previousMonthData) return null;
  
  const netPaymentCurrent = parseCurrencyValue(currentMonthData?.netPayment) || 0;
  const netPaymentPrevious = parseCurrencyValue(previousMonthData?.netPayment) || 0;
  
  const totalDifference = netPaymentCurrent - netPaymentPrevious;
  const percentChange = netPaymentPrevious !== 0 
    ? (totalDifference / netPaymentPrevious) * 100
    : 0;
  
  // Initialize variance explanation
  const explanation = {
    totalDifference,
    percentChange,
    components: [] as any[],
    primaryFactor: null as any,
    regionalPaymentDetails: [] as any[]
  };
  
  // Compare regional payments if available
  if (currentMonthData.regionalPayments && previousMonthData.regionalPayments) {
    const currentRegionalTotal = 
      parseCurrencyValue(currentMonthData.regionalPayments.totalAmount) || 0;
    const previousRegionalTotal = 
      parseCurrencyValue(previousMonthData.regionalPayments.totalAmount) || 0;
    
    const regionalDiff = currentRegionalTotal - previousRegionalTotal;
    const contribution = totalDifference !== 0 ? (regionalDiff / totalDifference) * 100 : 0;
    
    explanation.components.push({
      name: "Regional Payments",
      previous: previousRegionalTotal,
      current: currentRegionalTotal,
      difference: regionalDiff,
      contribution: contribution
    });
    
    // Analyze individual regional payments for one-time payments
    if (currentMonthData.regionalPayments.paymentDetails && 
        previousMonthData.regionalPayments.paymentDetails) {
      
      const allPaymentDescriptions = new Set();
      
      previousMonthData.regionalPayments.paymentDetails.forEach((item: any) => 
        allPaymentDescriptions.add(item.description));
      currentMonthData.regionalPayments.paymentDetails.forEach((item: any) => 
        allPaymentDescriptions.add(item.description));
      
      const individualChanges: any[] = [];
      
      allPaymentDescriptions.forEach(desc => {
        const prevPayment = previousMonthData.regionalPayments.paymentDetails.find(
          (p: any) => p.description === desc
        );
        const currPayment = currentMonthData.regionalPayments.paymentDetails.find(
          (p: any) => p.description === desc
        );
        
        const prevAmount = prevPayment ? parseCurrencyValue(prevPayment.amount) || 0 : 0;
        const currAmount = currPayment ? parseCurrencyValue(currPayment.amount) || 0 : 0;
        const paymentDiff = currAmount - prevAmount;
        
        // Only track significant changes
        if (Math.abs(paymentDiff) > 100 || 
            (prevAmount === 0 && currAmount > 0) || 
            (prevAmount > 0 && currAmount === 0)) {
          
          individualChanges.push({
            description: desc,
            previous: prevAmount,
            current: currAmount,
            difference: paymentDiff,
            contribution: totalDifference !== 0 ? (paymentDiff / totalDifference) * 100 : 0
          });
        }
      });
      
      // Sort by absolute contribution
      individualChanges.sort((a, b) => 
        Math.abs(b.contribution) - Math.abs(a.contribution));
      
      explanation.regionalPaymentDetails = individualChanges;
    }
  }
  
  // Compare supplementary payments
  const currentSupplementary = parseCurrencyValue(currentMonthData?.financials?.supplementaryPayments) || 0;
  const previousSupplementary = parseCurrencyValue(previousMonthData?.financials?.supplementaryPayments) || 0;
  
  const supplementaryDiff = currentSupplementary - previousSupplementary;
  const supplementaryContribution = totalDifference !== 0 
    ? (supplementaryDiff / totalDifference) * 100 
    : 0;
  
  explanation.components.push({
    name: "Supplementary Payments",
    previous: previousSupplementary,
    current: currentSupplementary,
    difference: supplementaryDiff,
    contribution: supplementaryContribution
  });
  
  // Compare ingredient costs
  const currentIngredient = parseCurrencyValue(currentMonthData?.financials?.netIngredientCost) || 0;
  const previousIngredient = parseCurrencyValue(previousMonthData?.financials?.netIngredientCost) || 0;
  
  const ingredientDiff = currentIngredient - previousIngredient;
  const ingredientContribution = totalDifference !== 0 
    ? (ingredientDiff / totalDifference) * 100 
    : 0;
  
  explanation.components.push({
    name: "Net Ingredient Cost",
    previous: previousIngredient,
    current: currentIngredient,
    difference: ingredientDiff,
    contribution: ingredientContribution
  });
  
  // Determine primary factor
  if (explanation.components.length > 0) {
    explanation.components.sort((a, b) => 
      Math.abs(b.contribution) - Math.abs(a.contribution));
    
    explanation.primaryFactor = explanation.components[0];
  }
  
  return explanation;
}

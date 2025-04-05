
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
  if (!value) return '£0.00';
  
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
  
  // If no year found, return current year
  return new Date().getFullYear();
}

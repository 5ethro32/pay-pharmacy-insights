
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
 * Format a number with thousands separators
 */
export function formatNumber(value: any): string {
  if (!value && value !== 0) return '0';
  
  // Convert to number and format
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(number)) return value;
  
  return new Intl.NumberFormat('en-GB').format(number);
}

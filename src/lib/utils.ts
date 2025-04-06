
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a value as currency (GBP)
 */
export function formatCurrency(value: any): string {
  if (value === undefined || value === null || value === '') return '£0.00';
  
  // Remove currency symbol if present
  let numericValue = value;
  if (typeof value === 'string') {
    numericValue = value.replace(/[£$,]/g, '');
  }
  
  // Convert to number and format
  const number = parseFloat(numericValue);
  if (isNaN(number)) return String(value);
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(number);
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: any): string {
  if (value === undefined || value === null || value === '') return '0';
  
  // Convert to number and format
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(number)) return String(value);
  
  return new Intl.NumberFormat('en-GB').format(number);
}

/**
 * Safe number formatting with fallback for undefined values
 */
export function safeFormatNumber(value: any, defaultValue = '0'): string {
  if (value === undefined || value === null) return defaultValue;
  return formatNumber(value);
}

/**
 * Safe currency formatting with fallback for undefined values
 */
export function safeFormatCurrency(value: any, defaultValue = '£0.00'): string {
  if (value === undefined || value === null) return defaultValue;
  return formatCurrency(value);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: any): string {
  if (value === undefined || value === null) return '0.0%';
  
  const number = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(number)) return '0.0%';
  
  return `${number.toFixed(1)}%`;
}

/**
 * Format month name to capitalize first letter
 */
export function formatMonth(month: string | undefined): string {
  if (!month) return '';
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
}

/**
 * Get abbreviated month name (first 3 letters)
 */
export function getAbbreviatedMonth(month: string): string {
  if (!month) return '';
  return month.substring(0, 3);
}

/**
 * Safe formatter for any value type that might be undefined
 */
export function safeFormatter(value: any, formatter: (val: any) => string, defaultValue: string): string {
  if (value === undefined || value === null) return defaultValue;
  try {
    return formatter(value);
  } catch (e) {
    console.error("Formatting error:", e);
    return defaultValue;
  }
}

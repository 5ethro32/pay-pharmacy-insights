
import { formatCurrency, formatNumber } from "@/lib/utils";

interface MetricConfig {
  label: string;
  description: string;
  format: (value: number) => string;
  colorClass: string;
  color: string; // Added color property for chart rendering
}

export type MetricKey = 
  | "netPayment" 
  | "totalItems" 
  | "grossValue" 
  | "pharmacyFirstTotal" 
  | "margin"
  | "supplementaryPayments"
  | "pharmacyFirst"
  | "regionalPayments"
  | "averageValuePerItem"
  | "grossIngredientCost"; // Added missing metric

export const METRICS: Record<MetricKey, MetricConfig> = {
  netPayment: {
    label: "Net Payment",
    description: "Total net payment to bank",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-900",
    color: "#9c1f28",
  },
  totalItems: {
    label: "Total Items",
    description: "Number of prescription items",
    format: (value) => formatNumber(value),
    colorClass: "text-red-800",
    color: "#b52532",
  },
  grossValue: {
    label: "Gross Value",
    description: "Average gross value per item",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-700",
    color: "#c73845",
  },
  pharmacyFirstTotal: {
    label: "Pharmacy First",
    description: "Total Pharmacy First payments",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-600",
    color: "#d84b57",
  },
  pharmacyFirst: {
    label: "Pharmacy First",
    description: "Pharmacy First payments",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-500",
    color: "#e85a68",
  },
  regionalPayments: {
    label: "Regional Payments",
    description: "Total regional payments",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-400",
    color: "#f87171",
  },
  margin: {
    label: "Margin",
    description: "Net Payment - Gross Cost (%)",
    format: (value) => `${value.toFixed(1)}%`,
    colorClass: "text-red-500",
    color: "#e85a68",
  },
  supplementaryPayments: {
    label: "Supplementary Payments",
    description: "Total supplementary & service payments",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-500",
    color: "#e85a68",
  },
  averageValuePerItem: {
    label: "Average Value per Item",
    description: "Net payment per prescription item",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-300",
    color: "#fda4af",
  },
  grossIngredientCost: {
    label: "Gross Ingredient Cost",
    description: "Total cost before deductions",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-700",
    color: "#c73845",
  }
};

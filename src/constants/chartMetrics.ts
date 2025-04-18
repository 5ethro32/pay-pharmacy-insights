
import { formatCurrency, formatNumber } from "@/lib/utils";

interface MetricConfig {
  label: string;
  description: string;
  format: (value: number) => string;
  colorClass: string;
  color: string;
}

export type MetricKey = 
  | "netPayment"
  | "grossIngredientCost"
  | "supplementaryPayments"
  | "totalItems"
  | "averageValuePerItem";

export const METRICS: Record<MetricKey, MetricConfig> = {
  netPayment: {
    label: "Net Payment",
    description: "Total net payment to bank",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-900",
    color: "#9c1f28",
  },
  grossIngredientCost: {
    label: "Gross Ingredient Cost",
    description: "Total cost before deductions",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-800",
    color: "#b52532",
  },
  supplementaryPayments: {
    label: "Supplementary Payments",
    description: "Total supplementary & service payments",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-700",
    color: "#c73845",
  },
  totalItems: {
    label: "Total Items Dispensed",
    description: "Number of prescription items",
    format: (value) => formatNumber(value),
    colorClass: "text-red-600",
    color: "#d84b57",
  },
  averageValuePerItem: {
    label: "Average Value per Item",
    description: "Average cost per dispensed item",
    format: (value) => formatCurrency(value),
    colorClass: "text-red-500",
    color: "#e85a68",
  }
};

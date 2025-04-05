
export const METRICS = {
  netPayment: {
    label: "Net Payment",
    format: (val: number) => `£${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 2 })}`,
    color: "#9b87f5"
  },
  totalItems: {
    label: "Total Items",
    format: (val: number) => val?.toLocaleString() || "0",
    color: "#0EA5E9"
  },
  grossValue: {
    label: "Average Value",
    format: (val: number) => `£${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 2 })}`,
    color: "#F97316"
  },
  pharmacyFirstTotal: {
    label: "PFS Payments",
    format: (val: number) => `£${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 2 })}`,
    color: "#D946EF"
  },
  margin: {
    label: "Margin",
    format: (val: number) => `${(val || 0).toLocaleString('en-UK', { maximumFractionDigits: 1 })}%`,
    color: "#10B981"
  }
};

export type MetricKey = keyof typeof METRICS;

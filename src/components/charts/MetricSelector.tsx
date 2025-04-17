
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METRICS, MetricKey } from "@/constants/chartMetrics";

interface MetricSelectorProps {
  selectedMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({ 
  selectedMetric, 
  onMetricChange 
}) => {
  const metrics: { key: MetricKey; label: string }[] = [
    { key: "netPayment", label: "Net Payment" },
    { key: "totalItems", label: "Total Items" },
    { key: "pharmacyFirst", label: "Pharmacy First" },
    { key: "regionalPayments", label: "Regional Payments" },
    { key: "supplementaryPayments", label: "Supplementary Payments" },
    { key: "averageValuePerItem", label: "Gross Value per Item" },
  ];

  return (
    <Select
      value={selectedMetric}
      onValueChange={(value) => onMetricChange(value as MetricKey)}
    >
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Select metric" />
      </SelectTrigger>
      <SelectContent>
        {metrics.map((metric) => (
          <SelectItem key={metric.key} value={metric.key}>
            {metric.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MetricSelector;

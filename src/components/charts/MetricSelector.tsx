
import React from "react";
import { METRICS, MetricKey } from "@/constants/chartMetrics";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MetricSelectorProps {
  selectedMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({ selectedMetric, onMetricChange }) => {
  return (
    <Select
      value={selectedMetric}
      onValueChange={(value) => onMetricChange(value as MetricKey)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select metric" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(METRICS).map(([key, { label }]) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MetricSelector;

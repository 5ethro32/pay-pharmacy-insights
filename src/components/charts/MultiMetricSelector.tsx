
import React, { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { METRICS, MetricKey } from "@/constants/chartMetrics";

interface MultiMetricSelectorProps {
  selectedMetrics: MetricKey[];
  onMetricsChange: (metrics: MetricKey[]) => void;
  primaryMetric: MetricKey;
  onPrimaryMetricChange: (metric: MetricKey) => void;
}

const MultiMetricSelector: React.FC<MultiMetricSelectorProps> = ({ 
  selectedMetrics, 
  onMetricsChange,
  primaryMetric,
  onPrimaryMetricChange 
}) => {
  const [open, setOpen] = useState(false);

  const metrics: { key: MetricKey; label: string }[] = [
    { key: "netPayment", label: "Net Payment" },
    { key: "grossIngredientCost", label: "Gross Ingredient Cost" },
    { key: "supplementaryPayments", label: "Supplementary Payments" },
    { key: "totalItems", label: "Total Items Dispensed" },
    { key: "averageValuePerItem", label: "Average Value per Item" },
  ];

  const toggleMetric = (metric: MetricKey) => {
    if (selectedMetrics.includes(metric)) {
      // Don't allow removing the last metric
      if (selectedMetrics.length === 1) {
        return;
      }
      
      // If removing the primary metric, set a new primary
      if (metric === primaryMetric) {
        const remaining = selectedMetrics.filter(m => m !== metric);
        onPrimaryMetricChange(remaining[0]);
      }
      
      onMetricsChange(selectedMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };
  
  const setPrimaryMetric = (metric: MetricKey) => {
    // Ensure the metric is selected before making it primary
    if (!selectedMetrics.includes(metric)) {
      onMetricsChange([...selectedMetrics, metric]);
    }
    onPrimaryMetricChange(metric);
  };

  const removeMetric = (metric: MetricKey, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Don't allow removing the last metric
    if (selectedMetrics.length === 1) {
      return;
    }
    
    // If removing the primary metric, set a new primary
    if (metric === primaryMetric) {
      const remaining = selectedMetrics.filter(m => m !== metric);
      onPrimaryMetricChange(remaining[0]);
    }
    
    onMetricsChange(selectedMetrics.filter(m => m !== metric));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white border-gray-200"
          >
            <span>Compare Metrics</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white" align="start">
          {metrics.map((metric) => (
            <DropdownMenuCheckboxItem
              key={metric.key}
              checked={selectedMetrics.includes(metric.key)}
              onSelect={(e) => {
                e.preventDefault();
                toggleMetric(metric.key);
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {primaryMetric === metric.key && (
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                )}
                {metric.label}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs text-gray-500">
            Select metrics to compare
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
        {selectedMetrics.map((metricKey) => (
          <Badge 
            key={metricKey}
            variant={primaryMetric === metricKey ? "default" : "outline"}
            className={`px-3 py-1 cursor-pointer ${
              primaryMetric === metricKey 
              ? `bg-${METRICS[metricKey].colorClass} text-white` 
              : `border-${METRICS[metricKey].colorClass} text-${METRICS[metricKey].colorClass} hover:bg-gray-100`
            }`}
            style={{
              backgroundColor: primaryMetric === metricKey ? METRICS[metricKey].color : 'transparent',
              borderColor: METRICS[metricKey].color,
              color: primaryMetric === metricKey ? 'white' : METRICS[metricKey].color
            }}
            onClick={() => setPrimaryMetric(metricKey)}
          >
            {METRICS[metricKey].label}
            <X 
              className="ml-1 h-3 w-3 hover:opacity-100 opacity-80" 
              onClick={(e) => removeMetric(metricKey, e)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default MultiMetricSelector;

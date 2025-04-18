
import React from "react";
import { MetricKey } from "@/constants/chartMetrics";
import { METRICS } from "@/constants/chartMetrics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  selectedMetric: MetricKey;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, selectedMetric }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="font-medium">{data.fullMonth} {data.year}</div>
        <div className="mt-1 flex items-center">
          <div 
            className="mr-2 h-2 w-2 rounded-full"
            style={{ backgroundColor: METRICS[selectedMetric].color }}
          />
          <div className="font-semibold">
            {METRICS[selectedMetric].format(data.value)}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default ChartTooltip;

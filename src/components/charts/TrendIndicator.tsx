
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendIndicatorProps {
  firstValue: number;
  lastValue: number;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ firstValue, lastValue }) => {
  const trendPercentage = firstValue !== 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : 0;
    
  if (trendPercentage === 0) {
    return null;
  }
  
  const trendMessage = `${Math.abs(trendPercentage).toFixed(1)}% ${trendPercentage >= 0 ? 'increase' : 'decrease'} overall`;
  
  return (
    <div className="flex items-center text-sm font-medium">
      {trendPercentage > 0 ? (
        <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
      ) : (
        <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
      )}
      <span className={trendPercentage > 0 ? "text-green-600" : "text-red-600"}>
        {trendMessage}
      </span>
    </div>
  );
};

export default TrendIndicator;

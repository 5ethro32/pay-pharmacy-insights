
import React from "react";
import { TrendingUp, TrendingDown, Equal } from "lucide-react";

interface TrendIndicatorProps {
  firstValue: number;
  lastValue: number;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ firstValue, lastValue }) => {
  // Check if both values are valid numbers
  if (isNaN(firstValue) || isNaN(lastValue) || firstValue === null || lastValue === null) {
    return null;
  }
  
  // Calculate the difference between the values
  const difference = lastValue - firstValue;
  
  // If there's absolutely no difference, show stable indicator
  if (difference === 0) {
    return (
      <div className="flex items-center text-sm font-medium">
        <Equal className="mr-1 h-4 w-4 text-gray-500" />
        <span className="text-gray-600">Stable</span>
      </div>
    );
  }
  
  // Calculate the trend percentage with appropriate handling for zero values
  const trendPercentage = firstValue !== 0 
    ? ((lastValue - firstValue) / firstValue) * 100 
    : lastValue > 0 ? 100 : 0;
    
  // If change is less than 0.1%, show stable indicator
  if (Math.abs(trendPercentage) < 0.1) {
    return (
      <div className="flex items-center text-sm font-medium">
        <Equal className="mr-1 h-4 w-4 text-gray-500" />
        <span className="text-gray-600">Stable ({trendPercentage >= 0 ? '+' : '-'}{Math.abs(trendPercentage).toFixed(3)}%)</span>
      </div>
    );
  }
  
  // Format the percentage with one decimal place for normal changes
  const formattedPercentage = Math.abs(trendPercentage).toFixed(1);
  const trendMessage = `${formattedPercentage}% ${trendPercentage >= 0 ? 'increase' : 'decrease'} overall`;
  
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

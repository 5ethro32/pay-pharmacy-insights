
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

export const renderChangeIndicator = (changeValue: number, size = "small") => {
  const isPositive = changeValue > 0;
  
  if (Math.abs(changeValue) < 0.1) return null; // No significant change
  
  if (size === "small") {
    return (
      <span className={`inline-flex items-center ml-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isPositive ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
        }
      </span>
    );
  } else {
    return (
      <span className={`inline-flex items-center ml-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isPositive ? 
          <TrendingUp className="h-5 w-5" /> : 
          <TrendingDown className="h-5 w-5" />
        }
        <span className="text-xs font-medium ml-0.5">{Math.abs(changeValue).toFixed(1)}%</span>
      </span>
    );
  }
};

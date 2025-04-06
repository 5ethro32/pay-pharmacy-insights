
import React from 'react';
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface MonthSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  className?: string;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = ""
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Select 
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger 
        className={`w-full min-w-[160px] ${isMobile ? 'px-2' : 'px-3'} bg-white border-gray-200 ${className}`}
      >
        <div className="flex items-center w-full">
          <Calendar className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'} text-red-800 flex-shrink-0`} />
          <SelectValue 
            placeholder={placeholder}
            className={`${isMobile ? 'text-sm truncate max-w-[85%]' : 'text-base'}`}
          />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="capitalize"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthSelector;

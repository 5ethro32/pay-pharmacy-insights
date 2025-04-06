
import React from "react";
import { Calendar } from "lucide-react";
import { PaymentData } from "@/types/paymentTypes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentPeriodSelectorProps {
  sortedDocuments: PaymentData[];
  selectedMonth: string | null;
  handleMonthSelect: (monthKey: string) => void;
  formatMonth: (month: string) => string;
}

const PaymentPeriodSelector: React.FC<PaymentPeriodSelectorProps> = ({
  sortedDocuments,
  selectedMonth,
  handleMonthSelect,
  formatMonth,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mb-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
          Payment Details
        </h3>
      </div>
      <Select 
        value={selectedMonth || ''}
        onValueChange={handleMonthSelect}
      >
        <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-red-800 mr-2" />
            <SelectValue placeholder="Select period" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortedDocuments.map((doc) => (
            <SelectItem 
              key={`${doc.month}-${doc.year}`} 
              value={`${doc.month} ${doc.year}`}
              className="capitalize"
            >
              {formatMonth(doc.month)} {doc.year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentPeriodSelector;


import React from "react";
import { PaymentData } from "@/types/paymentTypes";

export interface PaymentPeriodSelectorProps {
  sortedDocuments: PaymentData[];
  selectedMonth: string | null;
  handleMonthSelect: (monthKey: string) => void;
  formatMonth: (month: string) => string;
}

const PaymentPeriodSelector: React.FC<PaymentPeriodSelectorProps> = ({
  sortedDocuments,
  selectedMonth,
  handleMonthSelect,
  formatMonth
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {sortedDocuments.map((doc) => {
        const monthKey = `${doc.month} ${doc.year}`;
        const isSelected = monthKey === selectedMonth;
        
        return (
          <button
            key={monthKey}
            onClick={() => handleMonthSelect(monthKey)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${isSelected 
                ? 'bg-red-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {formatMonth(doc.month)} {doc.year}
          </button>
        );
      })}
    </div>
  );
};

export default PaymentPeriodSelector;

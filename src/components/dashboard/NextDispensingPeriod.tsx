
import React from "react";
import { Calendar } from "lucide-react";

interface NextDispensingPeriodProps {
  nextDispensingPeriod: { month: string; year: number };
  nextPaymentDate: string;
  formatMonth: (month: string) => string;
}

const NextDispensingPeriod: React.FC<NextDispensingPeriodProps> = ({
  nextDispensingPeriod,
  nextPaymentDate,
  formatMonth
}) => {
  return (
    <div className="mt-4 bg-red-50/30 p-3 sm:p-4 rounded-md border border-red-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-red-800" />
        <div>
          <div className="font-semibold text-sm sm:text-base text-gray-900">Next Dispensing Period</div>
          <div className="text-gray-600 font-bold text-sm sm:text-base">{formatMonth(nextDispensingPeriod.month)} {nextDispensingPeriod.year}</div>
        </div>
      </div>
      <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
        <div className="font-semibold text-sm sm:text-base text-gray-900">Payment Date</div>
        <div className="bg-red-800 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium mt-1">
          {nextPaymentDate}
        </div>
      </div>
    </div>
  );
};

export default NextDispensingPeriod;

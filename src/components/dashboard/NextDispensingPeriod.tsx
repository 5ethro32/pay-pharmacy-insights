
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentData } from "@/types/paymentTypes";
import { Calendar } from "lucide-react";

export interface NextDispensingPeriodProps {
  currentData: PaymentData;
}

const NextDispensingPeriod = ({ currentData }: NextDispensingPeriodProps) => {
  // Get next month from current month
  const getNextMonth = () => {
    const months = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    
    const currentMonthIndex = months.indexOf(currentData.month);
    if (currentMonthIndex === -1) return "Next Month";
    
    const nextMonthIndex = (currentMonthIndex + 1) % 12;
    let nextYear = currentData.year;
    if (nextMonthIndex === 0) nextYear += 1;
    
    return `${months[nextMonthIndex].charAt(0)}${months[nextMonthIndex].slice(1).toLowerCase()} ${nextYear}`;
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(value);
  };
  
  // Get values from advance payments if available
  const nextMonthPayment = currentData.advancePayments?.nextMonth || 0;
  const nextMonthPaymentLabel = getNextMonth();
  
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Next Payment Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Advance Payment for</p>
            <p className="text-lg font-medium">{nextMonthPaymentLabel}</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <p className="text-sm text-gray-500 mb-1">Payment Amount</p>
            <p className="text-xl font-semibold text-blue-700">{formatCurrency(nextMonthPayment)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NextDispensingPeriod;

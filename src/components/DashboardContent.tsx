
import { useState } from "react";
import { PaymentData } from "@/types/paymentTypes";
import MonthlyComparison from "./MonthlyComparison";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";

interface DashboardContentProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardContent = ({ userId, documents, loading }: DashboardContentProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(null);
  
  const getSelectedData = () => {
    if (!selectedMonth) return null;
    
    const [month, yearStr] = selectedMonth.split(' ');
    const year = parseInt(yearStr);
    
    return documents.find(doc => doc.month === month && doc.year === year);
  };
  
  const getComparisonData = () => {
    if (!comparisonMonth) return null;
    
    const [month, yearStr] = comparisonMonth.split(' ');
    const year = parseInt(yearStr);
    
    return documents.find(doc => doc.month === month && doc.year === year);
  };
  
  const handleMonthSelect = (monthKey: string) => {
    if (monthKey === selectedMonth) return;
    
    // If the selected month is the current comparison month, swap them
    if (monthKey === comparisonMonth) {
      setComparisonMonth(selectedMonth);
    }
    
    setSelectedMonth(monthKey);
  };
  
  const handleComparisonSelect = (monthKey: string) => {
    if (monthKey === comparisonMonth) return;
    
    // If the comparison month is the current selected month, swap them
    if (monthKey === selectedMonth) {
      setSelectedMonth(comparisonMonth);
    }
    
    setComparisonMonth(monthKey);
  };

  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (documents.length < 1) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No payment schedules available. Please upload some documents.</p>
      </div>
    );
  }

  return (
    <>
      <MonthlyComparison 
        userId={userId}
        currentDocument={getSelectedData()}
        comparisonDocument={getComparisonData()}
        documentList={documents}
        onSelectMonth={handleMonthSelect}
        onSelectComparison={handleComparisonSelect}
        selectedMonth={selectedMonth || ''}
        comparisonMonth={comparisonMonth || ''}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {getSelectedData()?.regionalPayments && (
          <RegionalPaymentsChart regionalPayments={getSelectedData()?.regionalPayments} />
        )}
        
        <PaymentVarianceAnalysis 
          currentData={getSelectedData()} 
          previousData={getComparisonData()} 
        />
      </div>
    </>
  );
};

export default DashboardContent;

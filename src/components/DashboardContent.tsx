
import { useState, useEffect } from "react";
import { PaymentData } from "@/types/paymentTypes";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import AIInsightsPanel from "./AIInsightsPanel";
import LineChartMetrics from "./LineChartMetrics";
import KeyMetricsSummary from "./KeyMetricsSummary";
import ItemsBreakdown from "./ItemsBreakdown";
import FinancialBreakdown from "./FinancialBreakdown";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import PaymentScheduleDetails from "./PaymentScheduleDetails";
import HighValueItemsAnalysis from "./HighValueItemsAnalysis";
import ProcessingErrorsAnalysis from "./ProcessingErrorsAnalysis";

// Import new refactored components
import DashboardWelcomeHeader from "./dashboard/DashboardWelcomeHeader";
import NextDispensingPeriod from "./dashboard/NextDispensingPeriod";
import PaymentPeriodSelector from "./dashboard/PaymentPeriodSelector";
import DashboardLoading from "./dashboard/DashboardLoading";
import DashboardEmptyState from "./dashboard/DashboardEmptyState";
import { 
  sortDocumentsChronologically, 
  formatMonth, 
  getPaymentDate
} from "./dashboard/DashboardUtilityFunctions";
import { 
  checkUploadStatus, 
  getNextDispensingPeriod 
} from "./dashboard/DashboardStatusHelpers";
import { 
  getSelectedData, 
  getPreviousMonthData 
} from "./dashboard/DashboardDataHelpers";

interface DashboardContentProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardContent = ({ userId, documents, loading }: DashboardContentProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      
      if (data && data.full_name) {
        const firstNameFromFullName = data.full_name.split(' ')[0];
        setFirstName(firstNameFromFullName);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (documents.length > 0 && !selectedMonth) {
      const sortedDocs = sortDocumentsChronologically(documents);
      setSelectedMonth(`${sortedDocs[0].month} ${sortedDocs[0].year}`);
    }
  }, [documents, selectedMonth]);
  
  const handleMonthSelect = (monthKey: string) => {
    if (monthKey === selectedMonth) return;
    setSelectedMonth(monthKey);
  };

  if (loading) {
    return <DashboardLoading />;
  }

  if (documents.length < 1) {
    return <DashboardEmptyState />;
  }

  const sortedDocuments = sortDocumentsChronologically(documents);
  const currentData = getSelectedData(documents, selectedMonth);
  const previousMonthData = getPreviousMonthData(documents, selectedMonth);
  const uploadStatus = checkUploadStatus(documents);
  const nextDispensingPeriod = getNextDispensingPeriod();
  const nextPaymentDate = getPaymentDate(nextDispensingPeriod.month, nextDispensingPeriod.year);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {currentData && (
        <div className="mb-4 sm:mb-6">
          <DashboardWelcomeHeader 
            firstName={firstName}
            contractorCode={currentData.contractorCode}
            uploadStatus={uploadStatus}
          />
          
          <NextDispensingPeriod 
            nextDispensingPeriod={nextDispensingPeriod}
            nextPaymentDate={nextPaymentDate}
            formatMonth={formatMonth}
          />
        </div>
      )}
      
      {currentData && (
        <div className="w-full max-w-full overflow-hidden">
          <PaymentPeriodSelector
            sortedDocuments={sortedDocuments}
            selectedMonth={selectedMonth}
            handleMonthSelect={handleMonthSelect}
            formatMonth={formatMonth}
          />
          
          <div className="w-full max-w-full overflow-hidden">
            <KeyMetricsSummary 
              currentData={currentData} 
              previousData={previousMonthData} 
            />
          </div>
        </div>
      )}

      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 w-full">
          <div className="w-full max-w-full overflow-hidden">
            <ItemsBreakdown currentData={currentData} />
          </div>
          <div className="w-full max-w-full overflow-hidden">
            <FinancialBreakdown currentData={currentData} />
          </div>
        </div>
      )}
      
      {currentData && previousMonthData && (
        <div className="mt-4 w-full max-w-full overflow-hidden">
          <AIInsightsPanel 
            currentDocument={currentData}
            previousDocument={previousMonthData}
          />
        </div>
      )}
      
      {currentData && (
        <div className="mt-4 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
          <HighValueItemsAnalysis currentData={currentData} />
          <ProcessingErrorsAnalysis currentData={currentData} />
        </div>
      )}
      
      {documents.length >= 1 && (
        <div className="mb-6 sm:mb-8 w-full max-w-full overflow-hidden">
          <LineChartMetrics documents={documents} />
        </div>
      )}
      
      {currentData && (
        <div className="w-full mb-4 sm:mb-6 max-w-full overflow-hidden">
          <PaymentVarianceAnalysis 
            currentData={currentData} 
            previousData={previousMonthData} 
          />
        </div>
      )}
      
      {currentData && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-6 sm:mt-8 w-full max-w-full overflow-hidden">
          <PaymentScheduleDetails currentData={currentData} />
        </div>
      )}
    </div>
  );
};

export default DashboardContent;

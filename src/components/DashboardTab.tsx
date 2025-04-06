
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import FinancialBreakdown from "./FinancialBreakdown";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import HighValueItemsAnalysis from "./HighValueItemsAnalysis";
import ProcessingErrorsAnalysis from "./ProcessingErrorsAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardEmptyState from "./dashboard/DashboardEmptyState";
import DashboardLoading from "./dashboard/DashboardLoading";
import PaymentPeriodSelector from "./dashboard/PaymentPeriodSelector";
import DashboardWelcomeHeader from "./dashboard/DashboardWelcomeHeader";
import KeyMetricsSummary from "./KeyMetricsSummary";
import ItemsBreakdown from "./ItemsBreakdown";
import PaymentScheduleDetails from "./PaymentScheduleDetails";
import NextDispensingPeriod from "./dashboard/NextDispensingPeriod";

interface DashboardTabProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ userId, documents, loading }) => {
  const isMobile = useIsMobile();
  const [selectedDocumentId, setSelectedDocumentId] = React.useState<string | null>(null);
  
  // Default upload status
  const uploadStatus = {
    upToDate: documents.length > 0,
    message: documents.length > 0 ? "Data up to date" : "No data uploaded"
  };

  // Automatically select the most recent document when documents change
  React.useEffect(() => {
    if (documents.length > 0 && !selectedDocumentId) {
      setSelectedDocumentId(documents[0].id);
    }
  }, [documents, selectedDocumentId]);

  // Get current and previous document
  const currentData = documents.find(doc => doc.id === selectedDocumentId) || null;
  const currentIndex = documents.findIndex(doc => doc.id === selectedDocumentId);
  const previousData = currentIndex >= 0 && currentIndex < documents.length - 1 ? 
    documents[currentIndex + 1] : null;

  if (loading) {
    return <DashboardLoading />;
  }

  if (documents.length === 0) {
    return <DashboardEmptyState userId={userId} />;
  }

  // Extract first name from any data source available
  const firstName = "Pharmacy"; // Default placeholder
  const contractorCode = currentData?.contractorCode || "N/A";

  return (
    <div className="space-y-6 pb-8">
      <DashboardWelcomeHeader 
        firstName={firstName} 
        contractorCode={contractorCode}
        uploadStatus={uploadStatus}
      />
      
      <PaymentPeriodSelector 
        documents={documents}
        selectedId={selectedDocumentId || ""}
        onChange={setSelectedDocumentId}
      />
      
      {currentData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KeyMetricsSummary currentData={currentData} />
            <div className="md:col-span-2">
              <NextDispensingPeriod currentData={currentData} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentScheduleDetails currentData={currentData} />
            <FinancialBreakdown currentData={currentData} />
          </div>
          
          <PaymentVarianceAnalysis 
            currentData={currentData}
            previousData={previousData}
          />
          
          <div className="grid grid-cols-1 gap-6">
            <ItemsBreakdown currentData={currentData} />
            <HighValueItemsAnalysis currentData={currentData} />
            <ProcessingErrorsAnalysis currentData={currentData} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardTab;

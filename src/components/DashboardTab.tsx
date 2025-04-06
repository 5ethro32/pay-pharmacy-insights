
import DashboardContent from "./DashboardContent";
import { PaymentData } from "@/types/paymentTypes";
import WelcomeUploadPrompt from "./dashboard/WelcomeUploadPrompt";

interface DashboardTabProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardTab = ({ userId, documents, loading }: DashboardTabProps) => {
  const handleTabChange = (tab: string) => {
    const tabsElement = document.querySelector('[role="tablist"]');
    if (tabsElement) {
      const tabTrigger = tabsElement.querySelector(`[data-value="${tab}"]`) as HTMLButtonElement;
      if (tabTrigger) {
        tabTrigger.click();
      }
    }
  };
  
  // Add safety check for documents array
  if (!documents) {
    return null;
  }
  
  if (!loading && documents.length === 0) {
    return (
      <WelcomeUploadPrompt handleTabChange={handleTabChange} />
    );
  }
  
  if (documents.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm transition-shadow duration-300 hover:shadow-lg p-3 sm:p-6 w-full overflow-x-hidden">
        <DashboardContent 
          userId={userId}
          documents={documents}
          loading={loading}
        />
      </div>
    );
  }
  
  return null;
};

export default DashboardTab;

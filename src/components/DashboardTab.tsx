
import DashboardContent from "./DashboardContent";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  if (!loading && documents.length === 0) {
    return (
      <Card className="bg-white p-8">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <FileText className="h-10 w-10 text-red-800" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Pharmacy Dashboard</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Start by uploading your first pharmacy payment schedule to see analytics and insights.
            </p>
          </div>
          <Button 
            onClick={() => handleTabChange('upload')} 
            className="bg-red-800 hover:bg-red-700"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Your First Document
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (documents.length > 0) {
    const latestDocument = documents[0];
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-4 mb-6 rounded-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                COMMUNITY PHARMACY PAYMENT SUMMARY
              </h2>
              <p className="text-white/80 mt-1">Pharmacy eSchedule Dashboard</p>
            </div>
            <div className="flex flex-col items-start md:items-end text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-white/80">Contractor Code:</span>
                <span className="font-medium">{latestDocument.contractorCode || "N/A"}</span>
                <span className="text-white/80">Dispensing Month:</span>
                <span className="font-medium">{latestDocument.month} {latestDocument.year}</span>
                <span className="text-white/80">In Transition:</span>
                <span className="font-medium">No</span>
              </div>
            </div>
          </div>
        </div>
        
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

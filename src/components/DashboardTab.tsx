
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentData } from "@/types/paymentTypes";
import DashboardContent from "./DashboardContent";

interface DashboardTabProps {
  children?: React.ReactNode;  // Add support for children prop
  userId: string;
  documents: PaymentData[];
  loading: boolean;
  icon?: React.ReactNode;      // Add optional icon prop
  isActive?: boolean;          // Add optional isActive prop
  onClick?: () => void;        // Add optional onClick prop
}

const DashboardTab: React.FC<DashboardTabProps> = ({ 
  children,
  userId, 
  documents, 
  loading,
  icon,
  isActive,
  onClick
}) => {
  // If used as a tab button
  if (onClick !== undefined) {
    return (
      <button
        className={`px-4 py-2 flex items-center space-x-2 border-b-2 
          ${isActive 
            ? "border-red-800 text-red-800 font-medium" 
            : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
          } transition-colors`}
        onClick={onClick}
      >
        {icon && <span>{icon}</span>}
        {children && <span>{children}</span>}
      </button>
    );
  }
  
  // Safely check if documents exists and has length property
  const hasDocuments = Array.isArray(documents) && documents.length > 0;
  const handleTabChange = (tab: string) => {
    const tabsElement = document.querySelector('[role="tablist"]');
    if (tabsElement) {
      const tabTrigger = tabsElement.querySelector(`[data-value="${tab}"]`) as HTMLButtonElement;
      if (tabTrigger) {
        tabTrigger.click();
      }
    }
  };
  
  if (!loading && !hasDocuments) {
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
  
  if (hasDocuments) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
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

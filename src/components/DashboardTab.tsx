
import React from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  const handleUploadNavigation = () => {
    navigate('/dashboard?tab=upload');
  };
  
  if (!documents) {
    return null;
  }
  
  if (!loading && documents.length === 0) {
    return (
      <Card className="bg-white p-4 sm:p-8 transition-shadow duration-300 hover:shadow-lg w-full overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center space-y-4 sm:space-y-6 px-0 sm:px-4">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-red-100 flex items-center justify-center">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-red-800" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome to Your Pharmacy Dashboard</h2>
            <p className="text-gray-600 max-w-md mx-auto px-4">
              Start by uploading your first pharmacy payment schedule to see analytics and insights.
            </p>
          </div>
          <Button 
            onClick={handleUploadNavigation} 
            className="bg-red-800 hover:bg-red-700"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Your First Document
          </Button>
        </CardContent>
      </Card>
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

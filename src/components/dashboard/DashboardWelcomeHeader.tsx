
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

export interface DashboardWelcomeHeaderProps {
  firstName: string;
  contractorCode: string | undefined;
  uploadStatus: { upToDate: boolean; message: string };
}

const DashboardWelcomeHeader: React.FC<DashboardWelcomeHeaderProps> = ({ 
  firstName, 
  contractorCode, 
  uploadStatus 
}) => {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:gap-4 w-full">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {firstName ? `Hi, ${firstName}` : "Dashboard"}
        </h2>
        <p className="text-gray-600 mt-1">Welcome to your pharmacy payment dashboard</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full sm:w-auto">
        <Card className="bg-white hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">Contractor Code</div>
            <div className="font-bold text-base sm:text-xl">{contractorCode || "1737"}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">Upload Status</div>
            <div className="font-bold text-base sm:text-xl flex items-center">
              {uploadStatus.upToDate ? (
                <>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1" />
                  <span className="text-green-700 text-sm sm:text-base">{uploadStatus.message}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-1" />
                  <span className="text-amber-700 text-sm sm:text-base">{uploadStatus.message}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardWelcomeHeader;

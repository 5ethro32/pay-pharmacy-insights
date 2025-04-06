
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeUploadPromptProps {
  handleTabChange: (tab: string) => void;
}

const WelcomeUploadPrompt: React.FC<WelcomeUploadPromptProps> = ({ handleTabChange }) => {
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
          onClick={() => handleTabChange('upload')} 
          className="bg-red-800 hover:bg-red-700"
        >
          <Upload className="mr-2 h-4 w-4" /> Upload Your First Document
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeUploadPrompt;

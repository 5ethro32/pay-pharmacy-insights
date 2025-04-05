
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ErrorDisplayProps {
  onRetry?: () => void;
  message?: string;
  title?: string;
}

const ErrorDisplay = ({ 
  onRetry, 
  message = "We encountered an issue while loading your pharmacy data.",
  title = "Failed to load dashboard data"
}: ErrorDisplayProps) => {
  const { toast } = useToast();
  
  const handleRetry = () => {
    toast({
      title: "Retrying",
      description: "Attempting to reload your data...",
    });
    
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };
  
  return (
    <Card className="border border-red-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4 text-center">
            {message}
          </p>
          <Button onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;

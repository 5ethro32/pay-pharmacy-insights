
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ErrorDisplayProps {
  onRetry?: () => void;
  message?: string;
  title?: string;
  variant?: "error" | "timeout";
  autoRetry?: boolean;
}

const ErrorDisplay = ({ 
  onRetry, 
  message = "We encountered an issue while loading your pharmacy data.",
  title = "Failed to load dashboard data",
  variant = "error",
  autoRetry = false
}: ErrorDisplayProps) => {
  const { toast } = useToast();
  
  // Auto retry after a delay if enabled
  useEffect(() => {
    let retryTimer: NodeJS.Timeout | null = null;
    
    if (autoRetry && onRetry) {
      retryTimer = setTimeout(() => {
        toast({
          title: "Automatically retrying",
          description: "Attempting to reload your data...",
        });
        onRetry();
      }, 3000);
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [autoRetry, onRetry, toast]);
  
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
  
  const getIconColor = () => {
    return variant === "error" ? "text-red-700" : "text-amber-600";
  };
  
  const getIconBgColor = () => {
    return variant === "error" ? "bg-red-100" : "bg-amber-100";
  };
  
  const getBorderColor = () => {
    return variant === "error" ? "border-red-200" : "border-amber-200";
  };
  
  return (
    <Card className={`border ${getBorderColor()} shadow-sm`}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-10">
          <div className={`${getIconBgColor()} p-3 rounded-full mb-4`}>
            {variant === "error" ? (
              <AlertCircle className={`h-8 w-8 ${getIconColor()}`} />
            ) : (
              <RefreshCw className={`h-8 w-8 ${getIconColor()}`} />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 text-center max-w-lg px-4">
            {message}
          </p>
          <Button 
            onClick={handleRetry} 
            variant={variant === "error" ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;

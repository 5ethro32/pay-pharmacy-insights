
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  onRetry?: () => void;
}

const ErrorDisplay = ({ onRetry }: ErrorDisplayProps) => {
  return (
    <Card className="border border-red-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard data</h3>
          <p className="text-gray-600 mb-4 text-center">
            We encountered an issue while loading your pharmacy data.
          </p>
          <Button onClick={onRetry || (() => window.location.reload())}>
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;

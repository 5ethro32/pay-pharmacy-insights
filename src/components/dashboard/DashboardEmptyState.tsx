
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const DashboardEmptyState: React.FC = () => {
  return (
    <Card className="my-6 w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Payment Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No payment schedules available</h3>
          <p className="text-gray-500 mb-6">Please upload some documents in the Upload tab.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardEmptyState;

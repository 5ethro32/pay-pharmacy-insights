import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { METRICS, MetricKey } from "@/constants/chartMetrics";
import { PaymentData } from "@/types/paymentTypes";
import LineChartMetrics from "@/components/LineChartMetrics";
import RegionalPaymentsChart from "@/components/RegionalPaymentsChart";
import PharmacyFirstDetails from "@/components/PharmacyFirstDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChatWidget } from '@/components/chat/ChatWidget';

interface DashboardTabProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardTab = ({ userId, documents, loading }: DashboardTabProps) => {
  const isMobile = useIsMobile();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");

  const handleMetricChange = (metric: MetricKey) => {
    setSelectedMetric(metric);
  };

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold tracking-tight">
                Analytics Overview
              </h2>
            </div>
            <Select onValueChange={handleMetricChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METRICS).map(([key, metric]) => (
                  <SelectItem key={key} value={key as MetricKey}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <LineChartMetrics
              documents={documents}
              selectedMetric={selectedMetric}
              onMetricChange={handleMetricChange}
            />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold tracking-tight">
                  Regional Payments
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <RegionalPaymentsChart documents={documents} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-semibold tracking-tight">
                  Pharmacy First Details
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <PharmacyFirstDetails documents={documents} />
            </CardContent>
          </Card>
        </div>
        
        {isMobile && (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For a more detailed analysis, please view this page on a larger
                screen.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Add ChatWidget */}
      <ChatWidget documents={documents} selectedMetric={selectedMetric} />
    </>
  );
};

export default DashboardTab;

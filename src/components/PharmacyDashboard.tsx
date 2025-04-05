
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SummaryView from "./pharmacy-dashboard/SummaryView";
import DetailsView from "./pharmacy-dashboard/DetailsView";
import FinancialView from "./pharmacy-dashboard/FinancialView";
import BlurOverlay from "./pharmacy-dashboard/BlurOverlay";
import DashboardSkeleton from "./pharmacy-dashboard/DashboardSkeleton";
import ErrorDisplay from "./pharmacy-dashboard/ErrorDisplay";
import PharmacyHeader from "./pharmacy-dashboard/PharmacyHeader";
import { usePharmacyDashboardData } from "@/hooks/usePharmacyDashboardData";
import { formatCurrency, formatNumber, formatPercent } from "./pharmacy-dashboard/utils/formatters";
import { renderChangeIndicator } from "./pharmacy-dashboard/utils/indicators";
import { 
  pharmacyInfo, 
  itemCounts, 
  costs, 
  changes, 
  payments,
  insights,
  benchmarkInsights,
  financialInsights 
} from "@/data/pharmacyData";

interface PharmacyDashboardProps {
  view: "summary" | "details" | "financial";
  onLoad?: () => void;
}

const PharmacyDashboard = ({ view, onLoad }: PharmacyDashboardProps) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const { user } = useAuth();
  
  const { 
    isLoading, 
    hasError, 
    hasTimedOut, 
    retryLoading 
  } = usePharmacyDashboardData({ 
    view, 
    onLoad: () => {
      if (onLoad) onLoad();
    } 
  });

  useEffect(() => {
    if (user && isBlurred) {
      setIsBlurred(false);
    } else if (!user) {
      setTimeout(() => {
        if (isBlurred) setIsBlurred(false);
      }, 2000);
    }
  }, [user, isBlurred]);

  const handleSignUpPrompt = () => {
    alert("Sign up to access full dashboard features!");
  };

  if (isLoading) {
    return <DashboardSkeleton view={view} />;
  }

  if (hasTimedOut) {
    return (
      <ErrorDisplay 
        onRetry={retryLoading} 
        title="Data loading is taking longer than expected" 
        message="We're having trouble loading your dashboard data. Please try again or check your network connection."
      />
    );
  }

  if (hasError) {
    return <ErrorDisplay onRetry={retryLoading} />;
  }

  return (
    <div className="space-y-8">
      <Card className="border border-gray-200 shadow-sm relative">
        <PharmacyHeader pharmacyInfo={pharmacyInfo} />
        <CardContent className="pt-6">
          {view === "summary" && (
            <SummaryView
              itemCounts={itemCounts}
              costs={costs}
              changes={changes}
              payments={payments}
              insights={insights}
              benchmarkInsights={benchmarkInsights}
              formatNumber={formatNumber}
              formatCurrency={formatCurrency}
              renderChangeIndicator={renderChangeIndicator}
              isBlurred={isBlurred}
            />
          )}
          
          {view === "details" && (
            <DetailsView
              itemCounts={itemCounts}
              costs={costs}
              changes={changes}
              payments={payments}
              formatNumber={formatNumber}
              formatCurrency={formatCurrency}
              renderChangeIndicator={renderChangeIndicator}
              isBlurred={isBlurred}
            />
          )}
          
          {view === "financial" && (
            <FinancialView
              changes={changes}
              payments={payments}
              financialInsights={financialInsights}
              formatNumber={formatNumber}
              formatCurrency={formatCurrency}
              renderChangeIndicator={renderChangeIndicator}
            />
          )}
          
          {isBlurred && !user && (
            <BlurOverlay handleSignUpPrompt={handleSignUpPrompt} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyDashboard;

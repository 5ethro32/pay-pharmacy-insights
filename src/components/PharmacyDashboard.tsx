
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SummaryView from "./pharmacy-dashboard/SummaryView";
import DetailsView from "./pharmacy-dashboard/DetailsView";
import FinancialView from "./pharmacy-dashboard/FinancialView";
import BlurOverlay from "./pharmacy-dashboard/BlurOverlay";
import DashboardSkeleton from "./pharmacy-dashboard/DashboardSkeleton";
import { formatCurrency, formatNumber, formatPercent } from "./pharmacy-dashboard/utils/formatters";
import { renderChangeIndicator } from "./pharmacy-dashboard/utils/indicators";
import { AlertCircle } from "lucide-react";

interface PharmacyDashboardProps {
  view: "summary" | "details" | "financial";
}

const PharmacyDashboard = ({ view }: PharmacyDashboardProps) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user } = useAuth();
  
  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setHasError(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [view]);

  // Data models - these could be moved to an API call in a real application
  const pharmacyInfo = {
    contractorCode: "1737",
    dispensingMonth: "JANUARY 2025",
    inTransition: "No"
  };

  const itemCounts = {
    total: 9868,
    ams: 7751,
    mcr: 783,
    nhs: 342,
    cpus: 207,
    other: 785
  };

  const costs = {
    totalGross: 101708.89,
    amsGross: 84804.68,
    mcrGross: 5447.44,
    nhsGross: 1294.58,
    cpusGross: 1630.87,
    otherGross: 8531.32,
    avgGross: 10.19
  };

  const payments = {
    netIngredientCost: 100388.93,
    outOfPocket: 30.00,
    supplementaryPayments: 25556.52,
    stockOrderSubtotal: 175.89,
    dispensingPoolPayment: 12219.24,
    establishmentPayment: 2500.00,
    pharmacyFirstBase: 1000.00,
    pharmacyFirstActivity: 1400.06,
    phsSmoking: 60.00,
    phsContraceptive: 60.00,
    advancePayment: 138302.12,
    nextMonthAdvance: 138486.11,
    netPayment: 126774.45
  };

  const changes = {
    totalGross: 3.5,
    netIngredientCost: 2.8,
    supplementaryPayments: 5.2,
    netPayment: 4.1,
    itemCounts: -1.2,
    amsItems: 1.8,
    mcrItems: -2.5,
    nhsItems: -0.9
  };

  const insights = [
    {
      title: "Payment Growth Outpacing Volume",
      description: "Your net payments increased by 4.1% while prescription volume decreased by 1.2%. This indicates improved reimbursement rates compared to similar-sized pharmacies which averaged only 2.3% payment growth this quarter.",
      type: "positive" as const
    },
    {
      title: "AMS Performance Above Benchmark",
      description: "AMS items (7,751) represent 78.5% of your total volume, which is 8.2% higher than comparable pharmacies. This service line has grown 1.8% month-over-month while your peer group averaged 0.4% growth.",
      type: "positive" as const
    },
    {
      title: "M:CR Prescription Decline",
      description: "Your M:CR prescription items decreased by 2.5%, which is more than the average decrease of 1.3% seen across pharmacies of your size. Consider reviewing M:CR service promotion strategies.",
      type: "negative" as const
    }
  ];

  const benchmarkInsights = [
    {
      title: "Average Cost Per Item",
      description: "Your average cost per item (£10.19) is 8% higher than similar-sized pharmacies (£9.43). This may indicate a more complex dispensing mix or potential for generic substitution review.",
      type: "warning" as const
    },
    {
      title: "Dispensing Efficiency",
      description: "With 9,868 items processed by your pharmacy, you're operating at 12% higher efficiency than the average for your pharmacy size bracket (8,810 items).",
      type: "positive" as const
    }
  ];
  
  const financialInsights = [
    {
      title: "Category M Price Adjustment Impact",
      description: "Your pharmacy has a favorable position with recent Category M price adjustments, with a potential 2.7% increase in reimbursement value compared to the regional average of 1.9%.",
      type: "positive" as const
    },
    {
      title: "Service Diversification Opportunity",
      description: "Based on your prescription mix, expanding your PHS Contraceptive service could increase supplementary payments by up to £350 per month based on similar pharmacy performance.",
      type: "info" as const
    },
    {
      title: "Advanced Payment Optimization",
      description: "Your advanced payment schedule could be optimized based on your dispensing patterns. Our analysis shows a potential cash flow improvement of £2,800 monthly with adjusted timing.",
      type: "warning" as const
    }
  ];

  const handleSignUpPrompt = () => {
    alert("Sign up to access full dashboard features!");
  };

  // Auto-remove blur if user is authenticated
  useEffect(() => {
    if (user && isBlurred) {
      setIsBlurred(false);
    } else if (!user) {
      // Show blur for 2 seconds for demo effect if not authenticated
      setTimeout(() => {
        if (isBlurred) setIsBlurred(false);
      }, 2000);
    }
  }, [user, isBlurred]);

  if (isLoading) {
    return <DashboardSkeleton view={view} />;
  }

  if (hasError) {
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
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border border-gray-200 shadow-sm relative">
        <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-display">
                COMMUNITY PHARMACY PAYMENT SUMMARY
              </CardTitle>
              <p className="text-white/80 mt-1">Pharmacy eSchedule Dashboard</p>
            </div>
            <div className="flex flex-col items-start md:items-end text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-white/80">Contractor Code:</span>
                <span className="font-medium">{pharmacyInfo.contractorCode}</span>
                <span className="text-white/80">Dispensing Month:</span>
                <span className="font-medium">{pharmacyInfo.dispensingMonth}</span>
                <span className="text-white/80">In Transition:</span>
                <span className="font-medium">{pharmacyInfo.inTransition}</span>
              </div>
            </div>
          </div>
        </CardHeader>
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

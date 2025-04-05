
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import ServiceBreakdownChart from "./ServiceBreakdownChart";
import SupplementaryPaymentsChart from "./SupplementaryPaymentsChart";
import InsightsPanel from "../InsightsPanel";

interface SummaryViewProps {
  itemCounts: {
    total: number;
    ams: number;
    mcr: number;
    nhs: number;
    cpus: number;
    other: number;
  };
  costs: {
    totalGross: number;
    amsGross: number;
    mcrGross: number;
    nhsGross: number;
    cpusGross: number;
    otherGross: number;
    avgGross: number;
  };
  changes: {
    totalGross: number;
    netIngredientCost: number;
    supplementaryPayments: number;
    netPayment: number;
    itemCounts: number;
    amsItems: number;
    mcrItems: number;
    nhsItems: number;
  };
  payments: {
    dispensingPoolPayment: number;
    establishmentPayment: number;
    pharmacyFirstBase: number;
    pharmacyFirstActivity: number;
    phsSmoking: number;
    phsContraceptive: number;
    [key: string]: number;
  };
  insights: {
    title: string;
    description: string;
    type: "info" | "positive" | "negative" | "warning";
  }[];
  benchmarkInsights: {
    title: string;
    description: string;
    type: "info" | "positive" | "negative" | "warning";
  }[];
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, decimals?: number) => string;
  renderChangeIndicator: (changeValue: number, size?: string) => React.ReactNode;
  isBlurred: boolean;
}

const SummaryView = ({
  itemCounts,
  costs,
  changes,
  payments,
  insights,
  benchmarkInsights,
  formatNumber,
  formatCurrency,
  renderChangeIndicator,
  isBlurred
}: SummaryViewProps) => {
  const serviceBreakdownData = [
    { name: "AMS", value: itemCounts.ams, color: "#9c1f28" },
    { name: "M:CR", value: itemCounts.mcr, color: "#c73845" },
    { name: "NHS PFS", value: itemCounts.nhs, color: "#e85a68" },
    { name: "CPUS", value: itemCounts.cpus, color: "#f27d88" },
    { name: "Other", value: itemCounts.other, color: "#f9a3aa" }
  ];
  
  const supplementaryPaymentsData = [
    { name: "Dispensing Pool", value: payments.dispensingPoolPayment },
    { name: "Establishment", value: payments.establishmentPayment },
    { name: "Pharmacy First Base", value: payments.pharmacyFirstBase },
    { name: "Pharmacy First Activity", value: payments.pharmacyFirstActivity },
    { name: "PHS Smoking", value: payments.phsSmoking },
    { name: "PHS Contraceptive", value: payments.phsContraceptive }
  ];

  return (
    <div className={`space-y-8 ${isBlurred ? 'filter blur-sm' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Items Dispensed"
          value={formatNumber(itemCounts.total)}
          subtitle="Excluding stock orders"
          changeIndicator={renderChangeIndicator(changes.itemCounts, "large")}
        />
        
        <MetricCard
          title="Gross Ingredient Cost"
          value={formatCurrency(costs.totalGross, 2)}
          subtitle="Total cost before deductions"
          changeIndicator={renderChangeIndicator(changes.totalGross, "large")}
        />
        
        <MetricCard
          title="Average Value per Item"
          value={formatCurrency(costs.avgGross, 2)}
          subtitle="Average cost per dispensed item"
        />
      </div>
      
      <InsightsPanel insights={insights} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ServiceBreakdownChart 
              serviceBreakdownData={serviceBreakdownData} 
              formatNumber={formatNumber} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Supplementary Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SupplementaryPaymentsChart 
              supplementaryPaymentsData={supplementaryPaymentsData} 
              formatNumber={formatNumber}
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>
      
      <InsightsPanel insights={benchmarkInsights} />
    </div>
  );
};

export default SummaryView;

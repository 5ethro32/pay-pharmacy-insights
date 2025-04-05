import { useState, useMemo } from "react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectGroup, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown, Info } from "lucide-react";
import InsightsPanel from "./InsightsPanel";
import { PaymentData } from "./DashboardTabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface MonthlyComparisonProps {
  documents: PaymentData[];
  selectedMonth: string | null;
  comparisonMonth: string | null;
  onSelectMonth: (month: string) => void;
  onSelectComparison: (month: string) => void;
}

const MonthlyComparison = ({ 
  documents, 
  selectedMonth, 
  comparisonMonth, 
  onSelectMonth, 
  onSelectComparison 
}: MonthlyComparisonProps) => {
  const [viewMode, setViewMode] = useState<"summary" | "details" | "financial">("summary");

  const selectedData = useMemo(() => {
    if (!selectedMonth) return null;
    
    const [month, yearStr] = selectedMonth.split(' ');
    const year = parseInt(yearStr);
    
    return documents.find(doc => doc.month === month && doc.year === year);
  }, [documents, selectedMonth]);
  
  const comparisonData = useMemo(() => {
    if (!comparisonMonth) return null;
    
    const [month, yearStr] = comparisonMonth.split(' ');
    const year = parseInt(yearStr);
    
    return documents.find(doc => doc.month === month && doc.year === year);
  }, [documents, comparisonMonth]);
  
  const formatCurrency = (value: number | undefined, decimals = 2): string => {
    if (value === undefined) return '£0.00';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };
  
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return '0';
    return new Intl.NumberFormat('en-GB').format(value);
  };
  
  const calculateChange = (current: number | undefined, previous: number | undefined): number => {
    if (current === undefined || previous === undefined || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const generateInsights = () => {
    if (!selectedData || !comparisonData) return [];
    
    const insights = [];
    
    const itemsChange = calculateChange(selectedData.totalItems, comparisonData.totalItems);
    if (Math.abs(itemsChange) > 2) {
      insights.push({
        title: `${Math.abs(itemsChange).toFixed(1)}% ${itemsChange > 0 ? 'Increase' : 'Decrease'} in Total Items`,
        description: `Your pharmacy processed ${formatNumber(selectedData.totalItems)} items in ${selectedMonth}, compared to ${formatNumber(comparisonData.totalItems)} items in ${comparisonMonth}.`,
        type: itemsChange > 0 ? "positive" : "warning" as any
      });
    }
    
    const paymentChange = calculateChange(selectedData.netPayment, comparisonData.netPayment);
    if (Math.abs(paymentChange) > 2) {
      insights.push({
        title: `${Math.abs(paymentChange).toFixed(1)}% ${paymentChange > 0 ? 'Increase' : 'Decrease'} in Net Payment`,
        description: `Your net payment was ${formatCurrency(selectedData.netPayment)} in ${selectedMonth}, compared to ${formatCurrency(comparisonData.netPayment)} in ${comparisonMonth}.`,
        type: paymentChange > 0 ? "positive" : "negative" as any
      });
    }
    
    const amsChange = calculateChange(
      selectedData.itemCounts?.ams, 
      comparisonData.itemCounts?.ams
    );
    
    if (Math.abs(amsChange) > 3) {
      insights.push({
        title: `${Math.abs(amsChange).toFixed(1)}% ${amsChange > 0 ? 'Increase' : 'Decrease'} in AMS Items`,
        description: `Your AMS items ${amsChange > 0 ? 'grew' : 'decreased'} compared to last month. This service line represents ${selectedData.itemCounts?.ams ? ((selectedData.itemCounts.ams / selectedData.totalItems) * 100).toFixed(1) : '?'}% of your total volume.`,
        type: amsChange > 0 ? "positive" : "info" as any
      });
    }
    
    const avgValueCurrent = selectedData.netPayment / selectedData.totalItems;
    const avgValuePrevious = comparisonData.netPayment / comparisonData.totalItems;
    const avgValueChange = calculateChange(avgValueCurrent, avgValuePrevious);
    
    if (Math.abs(avgValueChange) > 1.5) {
      insights.push({
        title: `${Math.abs(avgValueChange).toFixed(1)}% ${avgValueChange > 0 ? 'Higher' : 'Lower'} Average Value per Item`,
        description: `Your average value per item is now ${formatCurrency(avgValueCurrent)}, compared to ${formatCurrency(avgValuePrevious)} previously. This ${avgValueChange > 0 ? 'indicates a more valuable prescription mix' : 'may indicate a lower value prescription mix'}.`,
        type: avgValueChange > 0 ? "positive" : "warning" as any
      });
    }
    
    return insights;
  };

  const serviceBreakdownData = useMemo(() => {
    if (!selectedData?.itemCounts) return [];
    
    return [
      { name: "AMS", value: selectedData.itemCounts.ams || 0, color: "#9c1f28" },
      { name: "M:CR", value: selectedData.itemCounts.mcr || 0, color: "#c73845" },
      { name: "NHS PFS", value: selectedData.itemCounts.nhsPfs || 0, color: "#e85a68" },
      { name: "CPUS", value: selectedData.itemCounts.cpus || 0, color: "#f27d88" },
      { name: "Other", value: calculateOther(selectedData.itemCounts), color: "#f9a3aa" }
    ];
  }, [selectedData]);
  
  function calculateOther(itemCounts: any) {
    const { total, ams = 0, mcr = 0, nhsPfs = 0, cpus = 0 } = itemCounts;
    return total - (ams + mcr + nhsPfs + cpus);
  }
  
  const monthlyComparisonData = useMemo(() => {
    if (!documents || documents.length < 2) return [];
    
    const sortedDocs = [...documents].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
                      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
      return months.indexOf(a.month.toUpperCase()) - months.indexOf(b.month.toUpperCase());
    });
    
    return sortedDocs.slice(-6).map(doc => ({
      month: doc.month.substring(0, 3),
      items: doc.totalItems,
      payment: doc.netPayment,
      year: doc.year
    }));
  }, [documents]);
  
  const trendData = useMemo(() => {
    if (!selectedData || !comparisonData) return [];
    
    return [
      { 
        name: comparisonData.month.substring(0, 3), 
        Items: comparisonData.totalItems,
        Payment: comparisonData.netPayment / 100,
      },
      { 
        name: selectedData.month.substring(0, 3), 
        Items: selectedData.totalItems,
        Payment: selectedData.netPayment / 100,
      }
    ];
  }, [selectedData, comparisonData]);
  
  const itemsChange = calculateChange(
    selectedData?.totalItems, 
    comparisonData?.totalItems
  );
  
  const paymentChange = calculateChange(
    selectedData?.netPayment,
    comparisonData?.netPayment
  );
  
  const avgItemValue = selectedData ? selectedData.netPayment / selectedData.totalItems : 0;
  const prevAvgItemValue = comparisonData ? comparisonData.netPayment / comparisonData.totalItems : 0;
  const avgValueChange = calculateChange(avgItemValue, prevAvgItemValue);
  
  const renderChangeIndicator = (changeValue: number) => {
    if (Math.abs(changeValue) < 0.1) return null;
    
    const isPositive = changeValue > 0;
    return (
      <span className={`inline-flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {isPositive ? 
          <ChevronUp className="h-5 w-5" /> : 
          <ChevronDown className="h-5 w-5" />
        }
        <span className="text-xs font-medium ml-0.5">{Math.abs(changeValue).toFixed(1)}%</span>
      </span>
    );
  };
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  if (!selectedData || !comparisonData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {documents.length < 2 
            ? "Please upload at least two payment schedules to view comparison data." 
            : "Please select months to compare."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-red-900">
          {selectedData.month} {selectedData.year} Payment Analysis
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select value={selectedMonth || ''} onValueChange={onSelectMonth}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {documents.map(doc => (
                    <SelectItem key={`${doc.month}-${doc.year}`} value={`${doc.month} ${doc.year}`}>
                      {doc.month} {doc.year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={comparisonMonth || ''} onValueChange={onSelectComparison}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Compare with" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {documents.map(doc => (
                    <SelectItem key={`compare-${doc.month}-${doc.year}`} value={`${doc.month} ${doc.year}`}>
                      {doc.month} {doc.year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-900">{formatNumber(selectedData.totalItems)}</span>
              {renderChangeIndicator(itemsChange)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Compared to {formatNumber(comparisonData.totalItems)} in {comparisonData.month}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Net Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-900">{formatCurrency(selectedData.netPayment)}</span>
              {renderChangeIndicator(paymentChange)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Compared to {formatCurrency(comparisonData.netPayment)} in {comparisonData.month}</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Average Value per Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-900">{formatCurrency(avgItemValue)}</span>
              {renderChangeIndicator(avgValueChange)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Compared to {formatCurrency(prevAvgItemValue)} in {comparisonData.month}</p>
          </CardContent>
        </Card>
      </div>
      
      <InsightsPanel insights={generateInsights()} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {serviceBreakdownData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#ffffff" 
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${formatNumber(value)}`, 'Count']}
                    labelFormatter={(name) => `${name}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Month-to-Month Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-80">
              <ChartContainer
                config={{
                  Items: {
                    label: "Items",
                    color: "#9c1f28",
                  },
                  Payment: {
                    label: "Payment (£00s)",
                    color: "#2563eb",
                  },
                }}
              >
                <BarChart 
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Items" fill="#9c1f28" name="Items" />
                  <Bar yAxisId="right" dataKey="Payment" fill="#2563eb" name="Payment (£00s)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {monthlyComparisonData.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Payment Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer
                config={{
                  items: {
                    label: "Items",
                    color: "#9c1f28",
                  },
                  payment: {
                    label: "Payment (£)",
                    color: "#2563eb",
                  },
                }}
              >
                <LineChart
                  data={monthlyComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: "Month", position: "insideBottom", offset: -10 }} 
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    label={{ value: "Items", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: "Payment (£)", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="items" 
                    name="Items" 
                    stroke="#9c1f28" 
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="payment" 
                    name="Payment (£)" 
                    stroke="#2563eb" 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MonthlyComparison;

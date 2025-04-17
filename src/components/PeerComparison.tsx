
import React, { useState, useEffect } from 'react';
import { PaymentData } from "@/types/paymentTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, HelpCircle, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PeerComparisonProps {
  userId: string;
  documentList: PaymentData[];
  peerData: any[];
  loading: boolean;
}

const PeerComparison: React.FC<PeerComparisonProps> = ({ 
  userId, 
  documentList, 
  peerData,
  loading 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>("netPayment");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }
  
  if (!documentList.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Upload your pharmacy data to see peer comparisons.</p>
      </div>
    );
  }

  const calculatePerItemMetrics = (data: PaymentData) => {
    const netPayment = data.netPayment || 
                      (data.extracted_data && typeof data.extracted_data === 'object' ? 
                       data.extracted_data.netPayment : 0);
    const totalItems = data.totalItems || 
                      (data.extracted_data && typeof data.extracted_data === 'object' ? 
                       data.extracted_data.totalItems : 0);
    
    return totalItems > 0 ? netPayment / totalItems : 0;
  };
  
  const prepareChartData = () => {
    // Group your pharmacy's data by month
    const yourData = documentList.reduce((acc: any, doc) => {
      const month = doc.month || 
                   (doc.extracted_data && typeof doc.extracted_data === 'object' ? 
                    doc.extracted_data.month : 'Unknown');
      const year = doc.year || 
                  (doc.extracted_data && typeof doc.extracted_data === 'object' ? 
                   doc.extracted_data.year : new Date().getFullYear());
      
      acc[`${month}-${year}`] = {
        month,
        year,
        yourValue: selectedMetric === 'paymentPerItem' ? 
                  calculatePerItemMetrics(doc) : 
                  getCurrentValue(doc, selectedMetric)
      };
      return acc;
    }, {});

    // Calculate peer averages by month
    const peerAverages = peerData.reduce((acc: any, doc) => {
      const month = doc.month || 
                    (doc.extracted_data && typeof doc.extracted_data === 'object' ? 
                     doc.extracted_data.month : 'Unknown');
      const year = doc.year || 
                   (doc.extracted_data && typeof doc.extracted_data === 'object' ? 
                    doc.extracted_data.year : new Date().getFullYear());
      const key = `${month}-${year}`;
      
      if (!acc[key]) {
        acc[key] = {
          month,
          year,
          values: [],
          count: 0
        };
      }
      
      const value = selectedMetric === 'paymentPerItem' ? 
                    calculatePerItemMetrics(doc) : 
                    getCurrentValue(doc, selectedMetric);
      
      acc[key].values.push(value);
      acc[key].count++;
      return acc;
    }, {});

    // Convert to chart data format
    const chartData = Object.keys(yourData).map(key => {
      const peerAvg = peerAverages[key] ? 
                     peerAverages[key].values.reduce((a: number, b: number) => a + b, 0) / 
                     peerAverages[key].count : 
                     0;

      return {
        name: `${yourData[key].month} ${yourData[key].year}`,
        "Your Pharmacy": yourData[key].yourValue,
        "Peer Average": peerAvg
      };
    });

    return chartData.sort((a, b) => {
      const [aMonth, aYear] = a.name.split(' ');
      const [bMonth, bYear] = b.name.split(' ');
      return (parseInt(aYear) - parseInt(bYear)) || aMonth.localeCompare(bMonth);
    });
  };

  const getCurrentValue = (data: PaymentData, metric: string) => {
    const extracted = data.extracted_data || {};
    const isValidObject = typeof extracted === 'object' && extracted !== null && !Array.isArray(extracted);
    
    switch(metric) {
      case "paymentPerItem":
        return calculatePerItemMetrics(data);
      case "netPayment":
        return data.netPayment || 
               (isValidObject ? extracted.netPayment : 0) || 
               0;
      case "totalItems":
        return data.totalItems || 
               (isValidObject ? (extracted.totalItems ||
                               (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
               0;
      case "ingredientCost":
        return (data.financials && data.financials.netIngredientCost) || 
               (isValidObject ? (extracted.ingredientCost ||
                               (extracted.financials && extracted.financials.netIngredientCost)) : 0) || 
               0;
      case "fees":
        return (data.financials && data.financials.feesAllowances) || 
               (isValidObject ? (extracted.feesAllowances ||
                               (extracted.financials && extracted.financials.feesAllowances)) : 0) || 
               0;
      case "deductions":
        return (data.financials && data.financials.deductions) || 
               (isValidObject ? (extracted.deductions ||
                               (extracted.financials && extracted.financials.deductions)) : 0) || 
               0;
      default:
        return data.netPayment || 
               (isValidObject ? extracted.netPayment : 0) || 
               0;
    }
  };
  
  const formatValue = (value: number, metric: string) => {
    switch(metric) {
      case "paymentPerItem":
        return formatCurrency(value) + " per item";
      case "netPayment":
      case "ingredientCost":
      case "fees":
      case "deductions":
        return formatCurrency(value);
      case "totalItems":
        return formatNumber(value);
      default:
        return formatCurrency(value);
    }
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
  };
  
  const metrics = [
    { key: "netPayment", label: "Net Payment", highIsGood: true },
    { key: "paymentPerItem", label: "Payment Per Item", highIsGood: true },
    { key: "totalItems", label: "Total Items", highIsGood: true },
    { key: "ingredientCost", label: "Ingredient Cost", highIsGood: false },
    { key: "fees", label: "Fees & Allowances", highIsGood: true },
    { key: "deductions", label: "Deductions", highIsGood: false }
  ];

  const chartData = prepareChartData();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium mb-1">Compare Metric</label>
          <Select
            value={selectedMetric}
            onValueChange={setSelectedMetric}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Metrics</SelectLabel>
                {metrics.map(metric => (
                  <SelectItem key={metric.key} value={metric.key}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>
            {metrics.find(m => m.key === selectedMetric)?.label} Comparison Over Time
          </CardTitle>
          <CardDescription>
            Your pharmacy compared to peer average across months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 30,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    formatValue(value, selectedMetric),
                    metrics.find(m => m.key === selectedMetric)?.label
                  ]}
                />
                <Legend />
                <Bar dataKey="Your Pharmacy" fill="#ef4444" />
                <Bar dataKey="Peer Average" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="font-semibold">About Peer Comparison (Premium Feature)</p>
        <p className="mt-2">
          This feature provides anonymous comparison with other pharmacy data in our system. 
          All data is anonymised to protect privacy. The comparison now includes a "Payment Per Item" 
          metric to help understand relative payment efficiency.
        </p>
      </div>
    </div>
  );
};

export default PeerComparison;

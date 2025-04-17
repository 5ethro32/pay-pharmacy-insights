
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
import { CheckCircle2, XCircle, HelpCircle, TrendingUp, TrendingDown } from "lucide-react";
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>("latest");
  
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
  
  // Get most recent document for the current user
  const currentUserData = documentList[0];
  
  // Filter peer data to match the same period as current user's data
  const relevantPeerData = peerData.filter(item => 
    item.year === currentUserData.year && item.month === currentUserData.month
  );
  
  // Prepare data for the chart
  const prepareChartData = () => {
    // Calculate averages and other statistics
    let totalValue = 0;
    let maxValue = 0;
    let minValue = Number.MAX_SAFE_INTEGER;
    
    // Access the correct property based on the selected metric
    const getCurrentValue = (data: any, metric: string) => {
      switch(metric) {
        case "netPayment":
          return data.netPayment || 0;
        case "totalItems":
          return data.totalItems || 0;
        case "ingredientCost":
          return data.financials?.netIngredientCost || 0;
        case "fees":
          return data.financials?.feesAllowances || 0;
        case "deductions":
          return data.financials?.deductions || 0;
        default:
          return data.netPayment || 0;
      }
    };
    
    // Calculate statistics from peer data
    relevantPeerData.forEach(item => {
      const value = getCurrentValue(item, selectedMetric);
      totalValue += value;
      maxValue = Math.max(maxValue, value);
      minValue = Math.min(minValue, value);
    });
    
    // If no peer data, set min to 0 to avoid displaying negative values
    if (relevantPeerData.length === 0) {
      minValue = 0;
    }
    
    const avgValue = relevantPeerData.length ? totalValue / relevantPeerData.length : 0;
    const currentValue = getCurrentValue(currentUserData, selectedMetric);
    
    // Create chart data
    return [
      { name: 'Your Pharmacy', value: currentValue, fill: '#ef4444' },
      { name: 'Peer Average', value: avgValue, fill: '#3b82f6' },
      { name: 'Peer Max', value: maxValue, fill: '#22c55e' },
      { name: 'Peer Min', value: minValue, fill: '#f97316' }
    ];
  };
  
  // Format currency values
  const formatValue = (value: number, metric: string) => {
    switch(metric) {
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
  
  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
  };
  
  // Format percentages
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Calculate position relative to peers
  const calculatePosition = () => {
    const getCurrentValue = (data: any, metric: string) => {
      switch(metric) {
        case "netPayment": return data.netPayment || 0;
        case "totalItems": return data.totalItems || 0;
        case "ingredientCost": return data.financials?.netIngredientCost || 0;
        case "fees": return data.financials?.feesAllowances || 0;
        case "deductions": return data.financials?.deductions || 0;
        default: return data.netPayment || 0;
      }
    };
    
    const currentValue = getCurrentValue(currentUserData, selectedMetric);
    let position = 'average';
    let percentAboveAvg = 0;
    
    if (relevantPeerData.length > 0) {
      const values = relevantPeerData.map(item => getCurrentValue(item, selectedMetric));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      if (avg === 0) {
        percentAboveAvg = 0;
      } else {
        percentAboveAvg = ((currentValue - avg) / avg) * 100;
      }
      
      if (percentAboveAvg > 10) position = 'excellent';
      else if (percentAboveAvg > 0) position = 'above average';
      else if (percentAboveAvg < -10) position = 'below average';
      else if (percentAboveAvg < 0) position = 'slightly below average';
    }
    
    return { position, percentAboveAvg };
  };
  
  const { position, percentAboveAvg } = calculatePosition();
  const chartData = prepareChartData();
  
  // Get metrics display name
  const getMetricName = (metric: string) => {
    const metricNames: Record<string, string> = {
      netPayment: 'Net Payment',
      ingredientCost: 'Ingredient Cost',
      fees: 'Fees & Allowances',
      deductions: 'Deductions',
      totalItems: 'Total Items'
    };
    return metricNames[metric] || metric;
  };
  
  // Get current metric value
  const getCurrentValue = (data: any, metric: string) => {
    switch(metric) {
      case "netPayment": return data.netPayment || 0;
      case "totalItems": return data.totalItems || 0;
      case "ingredientCost": return data.financials?.netIngredientCost || 0;
      case "fees": return data.financials?.feesAllowances || 0;
      case "deductions": return data.financials?.deductions || 0;
      default: return data.netPayment || 0;
    }
  };
  
  // Calculate peer average for a metric
  const getPeerAverage = (metric: string) => {
    if (relevantPeerData.length === 0) return 0;
    
    const values = relevantPeerData.map(item => getCurrentValue(item, metric));
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Create the metrics array for the breakdown table
  const metrics = [
    { key: "netPayment", label: "Net Payment", highIsGood: true },
    { key: "totalItems", label: "Total Items", highIsGood: true },
    { key: "ingredientCost", label: "Ingredient Cost", highIsGood: false },
    { key: "fees", label: "Fees & Allowances", highIsGood: true },
    { key: "deductions", label: "Deductions", highIsGood: false }
  ];
  
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
                <SelectLabel>Financial Metrics</SelectLabel>
                <SelectItem value="netPayment">Net Payment</SelectItem>
                <SelectItem value="ingredientCost">Ingredient Cost</SelectItem>
                <SelectItem value="fees">Fees & Allowances</SelectItem>
                <SelectItem value="deductions">Deductions</SelectItem>
                <SelectItem value="totalItems">Total Items</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium mb-1">Time Period</label>
          <Select 
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Period</SelectLabel>
                <SelectItem value="latest">Latest ({currentUserData.month} {currentUserData.year})</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>
              {getMetricName(selectedMetric)} Comparison
            </CardTitle>
            <CardDescription>
              Your pharmacy compared to {relevantPeerData.length} anonymised peers
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
                    formatter={(value: number) => [formatValue(value, selectedMetric), getMetricName(selectedMetric)]}
                  />
                  <Legend />
                  <Bar dataKey="value" name={getMetricName(selectedMetric)} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>How you compare to peers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your {getMetricName(selectedMetric)}:</span>
                <span className="font-bold">
                  {formatValue(getCurrentValue(currentUserData, selectedMetric), selectedMetric)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Peer Average:</span>
                <span>
                  {formatValue(getPeerAverage(selectedMetric), selectedMetric)}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Performance:</span>
                  <span className={`font-semibold ${percentAboveAvg > 0 ? 'text-green-600' : percentAboveAvg < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {position}
                    {percentAboveAvg > 0 ? (
                      <TrendingUp className="inline ml-1 h-4 w-4" />
                    ) : percentAboveAvg < 0 ? (
                      <TrendingDown className="inline ml-1 h-4 w-4" />
                    ) : null}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  You are {Math.abs(percentAboveAvg).toFixed(1)}% {percentAboveAvg >= 0 ? 'above' : 'below'} the peer average
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
          <CardDescription>Your pharmacy's metrics compared to peer averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Your Value</TableHead>
                  <TableHead>Peer Average</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map(metric => {
                  const yourValue = getCurrentValue(currentUserData, metric.key);
                  const peerAvg = getPeerAverage(metric.key);
                  
                  // Calculate difference and percentage
                  const difference = yourValue - peerAvg;
                  const percentDiff = peerAvg !== 0 ? (difference / peerAvg) * 100 : 0;
                  
                  // Determine if high is good or bad based on metric
                  const highIsGood = metric.highIsGood;
                  
                  // Determine status icon
                  let statusIcon = <HelpCircle className="h-5 w-5 text-blue-500" />;
                  if (Math.abs(percentDiff) < 5) {
                    statusIcon = <HelpCircle className="h-5 w-5 text-blue-500" />;
                  } else if ((percentDiff > 0 && highIsGood) || (percentDiff < 0 && !highIsGood)) {
                    statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
                  } else {
                    statusIcon = <XCircle className="h-5 w-5 text-red-500" />;
                  }
                  
                  return (
                    <TableRow key={metric.key}>
                      <TableCell className="font-medium">{metric.label}</TableCell>
                      <TableCell>{formatValue(yourValue, metric.key)}</TableCell>
                      <TableCell>{formatValue(peerAvg, metric.key)}</TableCell>
                      <TableCell className={`text-right ${percentDiff > 0 ? 'text-green-600' : percentDiff < 0 ? 'text-red-600' : ''}`}>
                        {percentDiff > 0 ? '+' : ''}{formatPercentage(percentDiff)}
                      </TableCell>
                      <TableCell className="text-right">
                        {statusIcon}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="font-semibold">About Peer Comparison (Premium Feature)</p>
        <p className="mt-2">
          This feature provides anonymous comparison with other pharmacy data in our system. 
          All data is anonymised to protect privacy. Peer comparison helps you understand how your 
          pharmacy performs relative to others in similar regions.
        </p>
      </div>
    </div>
  );
};

export default PeerComparison;

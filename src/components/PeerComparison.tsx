
import React, { useState } from 'react';
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
  const [selectedMetric, setSelectedMetric] = useState<string>("net_payment");
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
    
    relevantPeerData.forEach(item => {
      const value = item[selectedMetric] || 0;
      totalValue += value;
      maxValue = Math.max(maxValue, value);
      minValue = Math.min(minValue, value);
    });
    
    const avgValue = relevantPeerData.length ? totalValue / relevantPeerData.length : 0;
    const currentValue = currentUserData[selectedMetric as keyof PaymentData] as number || 0;
    
    // Generate percentile ranks for display
    const sortedValues = [...relevantPeerData.map(item => item[selectedMetric] || 0)].sort((a, b) => a - b);
    const currentRank = sortedValues.findIndex(val => val >= currentValue) + 1;
    const percentile = Math.round((currentRank / sortedValues.length) * 100);
    
    // Create chart data
    return [
      { name: 'Your Pharmacy', value: currentValue, fill: '#ef4444' },
      { name: 'Peer Average', value: avgValue, fill: '#3b82f6' },
      { name: 'Peer Max', value: maxValue, fill: '#22c55e' },
      { name: 'Peer Min', value: minValue, fill: '#f97316' }
    ];
  };
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
  };
  
  // Format percentages
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Get formatted value based on metric type
  const getFormattedValue = (value: number, metric: string) => {
    if (['net_payment', 'ingredient_cost', 'fees_allowances', 'deductions'].includes(metric)) {
      return formatCurrency(value);
    } else if (metric === 'total_items') {
      return formatNumber(value);
    }
    return value;
  };
  
  // Calculate position relative to peers
  const calculatePosition = () => {
    const currentValue = currentUserData[selectedMetric as keyof PaymentData] as number || 0;
    const values = relevantPeerData.map(item => item[selectedMetric] || 0);
    let position = 'average';
    let percentAboveAvg = 0;
    
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      percentAboveAvg = ((currentValue - avg) / avg) * 100;
      
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
      net_payment: 'Net Payment',
      ingredient_cost: 'Ingredient Cost',
      fees_allowances: 'Fees & Allowances',
      deductions: 'Deductions',
      total_items: 'Total Items'
    };
    return metricNames[metric] || metric;
  };
  
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
                <SelectItem value="net_payment">Net Payment</SelectItem>
                <SelectItem value="ingredient_cost">Ingredient Cost</SelectItem>
                <SelectItem value="fees_allowances">Fees & Allowances</SelectItem>
                <SelectItem value="deductions">Deductions</SelectItem>
                <SelectItem value="total_items">Total Items</SelectItem>
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
              Your pharmacy compared to {relevantPeerData.length} anonymized peers
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
                    formatter={(value: number) => [getFormattedValue(value, selectedMetric), "Value"]}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Value" />
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
                  {getFormattedValue(currentUserData[selectedMetric as keyof PaymentData] as number || 0, selectedMetric)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Peer Average:</span>
                <span>
                  {getFormattedValue(chartData[1].value, selectedMetric)}
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
                {['net_payment', 'ingredient_cost', 'fees_allowances', 'deductions', 'total_items'].map(metric => {
                  const yourValue = currentUserData[metric as keyof PaymentData] as number || 0;
                  
                  // Calculate peer average for this metric
                  const peerValues = relevantPeerData.map(item => item[metric] || 0);
                  const peerAvg = peerValues.length 
                    ? peerValues.reduce((a, b) => a + b, 0) / peerValues.length
                    : 0;
                  
                  // Calculate difference and percentage
                  const difference = yourValue - peerAvg;
                  const percentDiff = peerAvg !== 0 ? (difference / peerAvg) * 100 : 0;
                  
                  // Determine if high is good or bad based on metric
                  let highIsGood = true;
                  if (metric === 'deductions') {
                    highIsGood = false; // For deductions, lower is better
                  }
                  
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
                    <TableRow key={metric}>
                      <TableCell className="font-medium">{getMetricName(metric)}</TableCell>
                      <TableCell>{getFormattedValue(yourValue, metric)}</TableCell>
                      <TableCell>{getFormattedValue(peerAvg, metric)}</TableCell>
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
          All data is anonymized to protect privacy. Peer comparison helps you understand how your 
          pharmacy performs relative to others in similar regions.
        </p>
      </div>
    </div>
  );
};

export default PeerComparison;

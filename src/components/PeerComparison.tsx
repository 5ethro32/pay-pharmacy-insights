
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
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [relevantPeerData, setRelevantPeerData] = useState<any[]>([]);
  
  useEffect(() => {
    if (documentList.length > 0 && peerData.length > 0) {
      console.log("Setting relevant peer data with full peer data:", peerData);
      setRelevantPeerData(peerData);
    } else {
      setRelevantPeerData([]);
    }
  }, [documentList, peerData]);
  
  const metrics = [
    { key: "netPayment", label: "Net Payment", highIsGood: true },
    { key: "totalItems", label: "Total Items", highIsGood: true },
    { key: "ingredientCost", label: "Ingredient Cost", highIsGood: false },
    { key: "fees", label: "Fees & Allowances", highIsGood: true },
    { key: "deductions", label: "Deductions", highIsGood: false },
    { key: "supplementaryPayments", label: "Supplementary Payments", highIsGood: true },
    { key: "averageValuePerItem", label: "Average Value per Item", highIsGood: true }
  ];

  const prepareChartData = () => {
    const getCurrentValue = (data: PaymentData) => {
      const extracted = data.extracted_data || {};
      switch(selectedMetric) {
        case "netPayment":
          return data.netPayment || 
                 (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                 0;
        case "totalItems":
          return data.totalItems || 
                 (typeof extracted === 'object' ? (extracted.totalItems ||
                                                (extracted.itemCounts?.total)) : 0) || 
                 0;
        case "ingredientCost":
          return (data.financials?.netIngredientCost) || 
                 (typeof extracted === 'object' ? (extracted.ingredientCost ||
                                                (extracted.financials?.netIngredientCost)) : 0) || 
                 0;
        case "fees":
          return (data.financials?.feesAllowances) || 
                 (typeof extracted === 'object' ? (extracted.feesAllowances ||
                                                (extracted.financials?.feesAllowances)) : 0) || 
                 0;
        case "deductions":
          return (data.financials?.deductions) || 
                 (typeof extracted === 'object' ? (extracted.deductions ||
                                                (extracted.financials?.deductions)) : 0) || 
                 0;
        case "supplementaryPayments":
          return (data.financials?.supplementaryPayments) || 
                 (typeof extracted === 'object' && extracted.financials ? extracted.financials.supplementaryPayments : 0) || 
                 0;
        case "averageValuePerItem":
          const items = data.totalItems || 
                       (typeof extracted === 'object' ? (extracted.totalItems ||
                                                      (extracted.itemCounts?.total)) : 0) || 
                       1;
          const payment = data.netPayment || 
                         (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                         0;
          // Make sure we don't divide by zero and the result is reasonable
          return items > 0 ? payment / items : 0;
        default:
          return 0;
      }
    };

    const yourValue = getCurrentValue(documentList[0]);
    const peerAvg = relevantPeerData.length > 0 
      ? relevantPeerData.reduce((sum, peer) => sum + getCurrentValue(peer), 0) / relevantPeerData.length 
      : 0;

    return [
      { name: 'Your Pharmacy', value: yourValue, fill: '#ef4444' },
      { name: 'Peer Average', value: peerAvg, fill: '#3b82f6' }
    ];
  };

  const formatValue = (value: number, metric: string) => {
    switch(metric) {
      case "netPayment":
      case "ingredientCost":
      case "fees":
      case "deductions":
      case "supplementaryPayments":
        return formatCurrency(value);
      case "averageValuePerItem":
        return formatCurrency(value) + " per item";
      case "totalItems":
        return formatNumber(value);
      default:
        return formatCurrency(value);
    }
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const calculatePosition = () => {
    const getCurrentValue = (data: PaymentData) => {
      const extracted = data.extracted_data || {};
      
      switch(selectedMetric) {
        case "netPayment":
          return data.netPayment || 
                 (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                 0;
        case "totalItems":
          return data.totalItems || 
                 (typeof extracted === 'object' ? (extracted.totalItems ||
                                                (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
                 0;
        case "ingredientCost":
          return (data.financials && data.financials.netIngredientCost) || 
                 (typeof extracted === 'object' ? (extracted.ingredientCost ||
                                                (extracted.financials && extracted.financials.netIngredientCost)) : 0) || 
                 0;
        case "fees":
          return (data.financials && data.financials.feesAllowances) || 
                 (typeof extracted === 'object' ? (extracted.feesAllowances ||
                                                (extracted.financials && extracted.financials.feesAllowances)) : 0) || 
                 0;
        case "deductions":
          return (data.financials && data.financials.deductions) || 
                 (typeof extracted === 'object' ? (extracted.deductions ||
                                                (extracted.financials && extracted.financials.deductions)) : 0) || 
                 0;
        case "supplementaryPayments":
          return (data.financials?.supplementaryPayments) || 
                 (typeof extracted === 'object' && extracted.financials ? extracted.financials.supplementaryPayments : 0) || 
                 0;
        case "averageValuePerItem":
          const items = data.totalItems || 
                       (typeof extracted === 'object' ? (extracted.totalItems ||
                                                      (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
                       1;
          const payment = data.netPayment || 
                         (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                         0;
          return items > 0 ? payment / items : 0;
        default:
          return data.netPayment || 
                 (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                 0;
      }
    };
    
    const currentValue = getCurrentValue(documentList[0]);
    let position = 'average';
    let percentAboveAvg = 0;
    
    if (relevantPeerData.length > 0) {
      const values = relevantPeerData.map(item => getCurrentValue(item));
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
  
  const getMetricName = (metric: string) => {
    const metricNames: Record<string, string> = {
      netPayment: 'Net Payment',
      ingredientCost: 'Ingredient Cost',
      fees: 'Fees & Allowances',
      deductions: 'Deductions',
      totalItems: 'Total Items',
      supplementaryPayments: 'Supplementary Payments',
      averageValuePerItem: 'Average Value per Item'
    };
    return metricNames[metric] || metric;
  };
  
  const getCurrentValue = (data: PaymentData) => {
    const extracted = data.extracted_data || {};
    
    switch(selectedMetric) {
      case "netPayment":
        return data.netPayment || 
               (typeof extracted === 'object' ? extracted.netPayment : 0) || 
               0;
      case "totalItems":
        return data.totalItems || 
               (typeof extracted === 'object' ? (extracted.totalItems ||
                                                (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
               0;
      case "ingredientCost":
        return (data.financials && data.financials.netIngredientCost) || 
               (typeof extracted === 'object' ? (extracted.ingredientCost ||
                                                (extracted.financials && extracted.financials.netIngredientCost)) : 0) || 
               0;
      case "fees":
        return (data.financials && data.financials.feesAllowances) || 
               (typeof extracted === 'object' ? (extracted.feesAllowances ||
                                                (extracted.financials && extracted.financials.feesAllowances)) : 0) || 
               0;
      case "deductions":
        return (data.financials && data.financials.deductions) || 
               (typeof extracted === 'object' ? (extracted.deductions ||
                                                (extracted.financials && extracted.financials.deductions)) : 0) || 
               0;
      case "supplementaryPayments":
        return (data.financials?.supplementaryPayments) || 
               (typeof extracted === 'object' && extracted.financials ? extracted.financials.supplementaryPayments : 0) || 
               0;
      case "averageValuePerItem":
        const items = data.totalItems || 
                     (typeof extracted === 'object' ? (extracted.totalItems ||
                                                    (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
                     1;
        const payment = data.netPayment || 
                       (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                       0;
        // Ensure we don't get unreasonably large values by verifying items count
        return items >= 10 ? payment / items : 0;
      default:
        return data.netPayment || 
               (typeof extracted === 'object' ? extracted.netPayment : 0) || 
               0;
    }
  };
  
  const getPeerAverage = (metric: string) => {
    if (relevantPeerData.length === 0) return 0;
    
    let validValues: number[] = [];
    
    // For average value per item calculation, we need to be extra careful
    if (metric === "averageValuePerItem") {
      validValues = relevantPeerData.map(item => {
        const extracted = item.extracted_data || {};
        const items = item.totalItems || 
                     (typeof extracted === 'object' ? (extracted.totalItems ||
                                                    (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
                     0;
        const payment = item.netPayment || 
                       (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                       0;
        
        // Only include reasonable values (require at least 10 items)
        return items >= 10 ? payment / items : null;
      }).filter((value): value is number => value !== null);
    } else {
      // For other metrics, we can use our normal getCurrentValue function
      validValues = relevantPeerData.map(item => {
        const extracted = item.extracted_data || {};
        
        switch(metric) {
          case "netPayment":
            return item.netPayment || 
                   (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                   0;
          case "totalItems":
            return item.totalItems || 
                   (typeof extracted === 'object' ? (extracted.totalItems ||
                                                  (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
                   0;
          case "ingredientCost":
            return (item.financials && item.financials.netIngredientCost) || 
                   (typeof extracted === 'object' ? (extracted.ingredientCost ||
                                                  (extracted.financials && extracted.financials.netIngredientCost)) : 0) || 
                   0;
          case "fees":
            return (item.financials && item.financials.feesAllowances) || 
                   (typeof extracted === 'object' ? (extracted.feesAllowances ||
                                                  (extracted.financials && extracted.financials.feesAllowances)) : 0) || 
                   0;
          case "deductions":
            return (item.financials && item.financials.deductions) || 
                   (typeof extracted === 'object' ? (extracted.deductions ||
                                                  (extracted.financials && extracted.financials.deductions)) : 0) || 
                   0;
          case "supplementaryPayments":
            return (item.financials?.supplementaryPayments) || 
                   (typeof extracted === 'object' && extracted.financials ? extracted.financials.supplementaryPayments : 0) || 
                   0;
          default:
            return 0;
        }
      });
    }
    
    if (validValues.length === 0) return 0;
    return validValues.reduce((a, b) => a + b, 0) / validValues.length;
  };

  const getCurrentContractorCode = (data: PaymentData) => {
    let contractorCode = '';
  
    if (data.contractorCode) {
      contractorCode = data.contractorCode;
    } else if (data.extracted_data && 
              typeof data.extracted_data === 'object' && 
              !Array.isArray(data.extracted_data) && 
              data.extracted_data.contractorCode) {
      if (typeof data.extracted_data.contractorCode === 'string') {
        contractorCode = data.extracted_data.contractorCode;
      } else {
        contractorCode = documentList[0].id.substring(0, 4);
      }
    } else {
      contractorCode = documentList[0].id.substring(0, 4);
    }

    return contractorCode;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const { position, percentAboveAvg } = calculatePosition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium mb-1">Compare Metric</label>
          <Select
            value={selectedMetric}
            onValueChange={setSelectedMetric}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Financial Metrics</SelectLabel>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>
              {getMetricName(selectedMetric)} Comparison
            </CardTitle>
            <CardDescription>
              Your pharmacy ({getCurrentContractorCode(documentList[0])}) compared to {relevantPeerData.length} anonymised peers
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
                  {formatValue(getCurrentValue(documentList[0]), selectedMetric)}
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
                  const yourValue = metric.key === "averageValuePerItem" ? 
                    // Special calculation for average value per item
                    documentList[0].totalItems > 0 ? 
                      documentList[0].netPayment / documentList[0].totalItems : 0 :
                    getCurrentValue(documentList[0]);
                  
                  const peerAvg = getPeerAverage(metric.key);
                  
                  const difference = yourValue - peerAvg;
                  const percentDiff = peerAvg !== 0 ? (difference / peerAvg) * 100 : 0;
                  
                  const highIsGood = metric.highIsGood;
                  
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

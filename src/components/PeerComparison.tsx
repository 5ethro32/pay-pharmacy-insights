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
import { CheckCircle2, XCircle, HelpCircle, TrendingUp, TrendingDown, Crown, Star, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import PeerComparisonInsights from "@/components/PeerComparisonInsights";

interface PeerComparisonProps {
  userId: string;
  documentList: PaymentData[];
  peerData: any[];
  loading: boolean;
}

interface PerformanceDataItem {
  key: string;
  label: string;
  yourValue: number;
  peerAvg: number;
  difference: number;
  percentDiff: number;
  highIsGood: boolean;
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
  const [performanceData, setPerformanceData] = useState<PerformanceDataItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PaymentData | null>(
    documentList.length > 0 ? documentList[0] : null
  );
  
  const metrics = [
    { key: "netPayment", label: "Net Payment", highIsGood: true },
    { key: "totalItems", label: "Total Items", highIsGood: true },
    { key: "pharmacyFirst", label: "Pharmacy First", highIsGood: true },
    { key: "regionalPayments", label: "Regional Payments", highIsGood: true },
    { key: "supplementaryPayments", label: "Supplementary Payments", highIsGood: true },
    { key: "averageValuePerItem", label: "Average Value per Item (Calculated)", highIsGood: true },
    { key: "averageItemValue", label: "Average Item Value (Static)", highIsGood: true }
  ];

  useEffect(() => {
    if (selectedDocument && peerData.length > 0) {
      console.log("Setting relevant peer data with full peer data:", peerData);
      console.log("Current document data:", selectedDocument);
      setRelevantPeerData(peerData);
      
      const initialPerformanceData = metrics.map(metric => {
        const yourValue = metric.key === "averageValuePerItem" ? 
          selectedDocument.totalItems > 0 ? 
            selectedDocument.netPayment / selectedDocument.totalItems : 0 :
          getCurrentValue(selectedDocument, metric.key);
        
        const peerAvg = getPeerAverage(metric.key);
        const difference = yourValue - peerAvg;
        const percentDiff = peerAvg !== 0 ? (difference / peerAvg) * 100 : 0;
        
        return {
          key: metric.key,
          label: metric.label,
          yourValue,
          peerAvg,
          difference,
          percentDiff,
          highIsGood: metric.highIsGood
        };
      });
      
      setPerformanceData(initialPerformanceData);
    } else {
      setRelevantPeerData([]);
      setPerformanceData([]);
    }
  }, [selectedDocument, peerData]);

  const getCurrentValue = (data: PaymentData, metricKey: string = selectedMetric) => {
    const extracted = data.extracted_data || {};
    
    switch(metricKey) {
      case "netPayment":
        return data.netPayment || 
               (typeof extracted === 'object' ? extracted.netPayment : 0) || 
               0;
      case "totalItems":
        return data.totalItems || 
               (typeof extracted === 'object' ? (extracted.totalItems ||
                                              (extracted.itemCounts?.total)) : 0) || 
               0;
      case "pharmacyFirst":
        const pfsBase = (data.financials?.pharmacyFirstBase) || 
                       (typeof extracted === 'object' ? (extracted.financials?.pharmacyFirstBase) : 0) || 
                       0;
        const pfsActivity = (data.financials?.pharmacyFirstActivity) || 
                          (typeof extracted === 'object' ? (extracted.financials?.pharmacyFirstActivity) : 0) || 
                          0;
        return pfsBase + pfsActivity;
      case "regionalPayments":
        return (data.regionalPayments?.totalAmount) || 
               (typeof extracted === 'object' ? (extracted.regionalPayments?.totalAmount) : 0) || 
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
        return items >= 10 ? payment / items : 0;
      case "averageItemValue":
        const directValue = data.averageItemValue || 
                           (typeof extracted === 'object' ? extracted.averageItemValue : null);
        
        if (directValue !== null && directValue !== undefined) {
          return directValue;
        }
        
        const financialsValue = data.financials?.averageGrossValue || 
                              (typeof extracted === 'object' && extracted.financials ? 
                               extracted.financials.averageGrossValue : null);
        
        if (financialsValue !== null && financialsValue !== undefined) {
          return financialsValue;
        }
        
        const fallbackItems = data.totalItems || 
                            (typeof extracted === 'object' ? (extracted.totalItems ||
                                                           (extracted.itemCounts?.total)) : 0) || 
                            1;
        const fallbackPayment = data.netPayment || 
                              (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                              0;
        return fallbackItems >= 10 ? fallbackPayment / fallbackItems : 0;
      default:
        return data.netPayment || 
               (typeof extracted === 'object' ? extracted.netPayment : 0) || 
               0;
    }
  };

  const prepareChartData = () => {
    const yourValue = getCurrentValue(selectedDocument!);
    const peerAvg = relevantPeerData.length > 0 
      ? relevantPeerData.reduce((sum, peer) => sum + getCurrentValue(peer), 0) / relevantPeerData.length 
      : 0;

    return [
      { name: 'Your Pharmacy', value: yourValue, fill: '#b91c1c' },  // Using brand red color
      { name: 'Peer Average', value: peerAvg, fill: '#e5e7eb' }     // Light gray for contrast
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
        return new Intl.NumberFormat('en-GB', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).format(value);
      case "pharmacyFirst":
      case "regionalPayments":
        return formatCurrency(value);
      case "averageItemValue":
        return formatCurrency(value);
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
    const currentValue = getCurrentValue(selectedDocument!);
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
      pharmacyFirst: 'Pharmacy First',
      regionalPayments: 'Regional Payments',
      totalItems: 'Total Items',
      supplementaryPayments: 'Supplementary Payments',
      averageValuePerItem: 'Average Value per Item',
      averageItemValue: 'Average Item Value'
    };
    return metricNames[metric] || metric;
  };
  
  const getPeerAverage = (metric: string) => {
    if (relevantPeerData.length === 0) return 0;
    
    let validValues: number[] = [];
    
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
        
        return items >= 10 ? payment / items : null;
      }).filter((value): value is number => value !== null);
    } else if (metric === "averageItemValue") {
      validValues = relevantPeerData.map(item => {
        const extracted = item.extracted_data || {};
        
        const directValue = item.averageItemValue || 
                         (typeof extracted === 'object' ? extracted.averageItemValue : null);
        
        if (directValue !== null && directValue !== undefined) {
          return directValue;
        }
        
        const financialsValue = item.financials?.averageGrossValue || 
                              (typeof extracted === 'object' && extracted.financials ? 
                               extracted.financials.averageGrossValue : null);
        
        if (financialsValue !== null && financialsValue !== undefined) {
          return financialsValue;
        }
        
        const items = item.totalItems || 
                    (typeof extracted === 'object' ? (extracted.totalItems ||
                                                   (extracted.itemCounts && extracted.itemCounts.total)) : 0) || 
                    0;
        const payment = item.netPayment || 
                      (typeof extracted === 'object' ? extracted.netPayment : 0) || 
                      0;
        
        return items >= 10 ? payment / items : null;
      }).filter((value): value is number => value !== null);
    } else {
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
          case "pharmacyFirst":
            const pfsBase = (item.financials?.pharmacyFirstBase) || 
                           (typeof extracted === 'object' ? (extracted.financials?.pharmacyFirstBase) : 0) || 
                           0;
            const pfsActivity = (item.financials?.pharmacyFirstActivity) || 
                              (typeof extracted === 'object' ? (extracted.financials?.pharmacyFirstActivity) : 0) || 
                              0;
            return pfsBase + pfsActivity;
          case "regionalPayments":
            return (item.regionalPayments?.totalAmount) || 
                   (typeof extracted === 'object' ? (extracted.regionalPayments?.totalAmount) : 0) || 
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

  const handleMonthSelect = (monthKey: string) => {
    const selected = documentList.find(doc => `${doc.month} ${doc.year}` === monthKey);
    if (selected) {
      setSelectedDocument(selected);
    }
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
    <div className="space-y-6 w-full">
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200 mb-6 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Premium Feature</span>
          </div>
          <Star className="h-5 w-5 text-red-600" />
        </div>
      </div>

      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Peer Comparison</h1>
        <p className="text-gray-600 text-sm">
          Compare your pharmacy's performance against anonymised peers to gain insights and benchmarks.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-full sm:w-auto flex-grow">
          <label className="block text-sm font-medium mb-1">Select Month</label>
          <Select
            value={selectedDocument ? `${selectedDocument.month} ${selectedDocument.year}` : ''}
            onValueChange={handleMonthSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {documentList.map((doc) => (
                  <SelectItem 
                    key={`${doc.month}-${doc.year}`} 
                    value={`${doc.month} ${doc.year}`}
                  >
                    {doc.month} {doc.year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto flex-grow">
          <label className="block text-sm font-medium mb-1">Compare Metric</label>
          <Select
            value={selectedMetric}
            onValueChange={setSelectedMetric}
          >
            <SelectTrigger className="w-full">
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
              Your pharmacy ({getCurrentContractorCode(selectedDocument!)}) compared to {relevantPeerData.length} anonymised peers
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatValue(value, selectedMetric), getMetricName(selectedMetric)]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" name={getMetricName(selectedMetric)} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-red-50 border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Your Performance
              {percentAboveAvg > 0 && <Star className="h-5 w-5 text-red-600" />}
            </CardTitle>
            <CardDescription>How you compare to peers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your {getMetricName(selectedMetric)}:</span>
                <span className="font-bold">
                  {formatValue(getCurrentValue(selectedDocument!), selectedMetric)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Peer Average:</span>
                <span>
                  {formatValue(getPeerAverage(selectedMetric), selectedMetric)}
                </span>
              </div>
              
              <div className="border-t border-red-100 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Performance:</span>
                  <span className={`font-semibold ${
                    percentAboveAvg > 0 
                      ? 'text-green-600' 
                      : percentAboveAvg < 0 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                  }`}>
                    {position}
                    {percentAboveAvg > 0 ? (
                      <TrendingUp className="inline ml-1 h-4 w-4" />
                    ) : percentAboveAvg < 0 ? (
                      <TrendingDown className="inline ml-1 h-4 w-4" />
                    ) : null}
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-white/50 p-3 rounded-lg border border-red-100 mb-4">
                  You are {Math.abs(percentAboveAvg).toFixed(1)}% {percentAboveAvg >= 0 ? 'above' : 'below'} the peer average
                </div>
                
                <div className="rounded-lg border border-red-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-900/90 to-red-700 p-2">
                    <h4 className="text-white text-sm font-medium flex items-center">
                      <Activity className="mr-2 h-4 w-4" />
                      AI Insight
                    </h4>
                  </div>
                  <div className="p-3 bg-red-50">
                    <p className="text-sm text-gray-700">
                      {getCurrentValue(selectedDocument!) > getPeerAverage(selectedMetric) ? 
                        `Strong performance in ${getMetricName(selectedMetric).toLowerCase()}. Consider sharing best practices with peer pharmacies.` :
                        `Opportunity to improve ${getMetricName(selectedMetric).toLowerCase()} by analyzing successful peer strategies.`}
                    </p>
                  </div>
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
                {performanceData.map(metric => {
                  let statusIcon = <HelpCircle className="h-5 w-5 text-blue-500" />;
                  if (Math.abs(metric.percentDiff) < 5) {
                    statusIcon = <HelpCircle className="h-5 w-5 text-blue-500" />;
                  } else if ((metric.percentDiff > 0 && metric.highIsGood) || (metric.percentDiff < 0 && !metric.highIsGood)) {
                    statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
                  } else {
                    statusIcon = <XCircle className="h-5 w-5 text-red-500" />;
                  }
                  
                  return (
                    <TableRow key={metric.key}>
                      <TableCell className="font-medium">{metric.label}</TableCell>
                      <TableCell>{formatValue(metric.yourValue, metric.key)}</TableCell>
                      <TableCell>{formatValue(metric.peerAvg, metric.key)}</TableCell>
                      <TableCell className={`text-right ${metric.percentDiff > 0 ? 'text-green-600' : metric.percentDiff < 0 ? 'text-red-600' : ''}`}>
                        {metric.percentDiff > 0 ? '+' : ''}{formatPercentage(metric.percentDiff)}
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
      
      <PeerComparisonInsights
        currentMetric={selectedMetric}
        currentValue={getCurrentValue(selectedDocument!)}
        peerAverage={getPeerAverage(selectedMetric)}
        peerData={peerData}
      />

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

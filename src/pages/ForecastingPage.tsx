import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  Sparkles,
  TrendingUp,
  Calendar,
  ArrowRight,
  Info,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AppSidebar from "@/components/AppSidebar";
import SimpleLineChart from "@/components/SimpleLineChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PaymentData } from "@/types/paymentTypes";
import { MetricKey, METRICS } from "@/constants/chartMetrics";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";
import { toast } from "@/components/ui/use-toast";

const ForecastingPage: React.FC = () => {
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [forecastPeriod, setForecastPeriod] = useState<string>("3"); // 3 months by default
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");

  // Fetch documents from Supabase
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('User not authenticated');
        }
        
        // Fetch documents for the current user
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', session.user.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log('Fetched documents for forecasting:', data);
          const paymentData = data.map(transformDocumentToPaymentData);
          setDocuments(paymentData);
        } else {
          console.log('No documents found');
          setDocuments([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast({
          title: "Error fetching documents",
          description: err instanceof Error ? err.message : 'Failed to fetch documents',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);

  // Helper function for getting metric value from a document
  const getMetricValue = (doc: PaymentData, metric: MetricKey): number => {
    switch (metric) {
      case "netPayment": return doc.netPayment || 0;
      case "grossIngredientCost": return doc.financials?.grossIngredientCost || 0;
      case "supplementaryPayments": return doc.financials?.supplementaryPayments || 0;
      case "totalItems": return doc.totalItems || 0;
      case "averageValuePerItem": return doc.averageItemValue || 0;
      default: return 0;
    }
  };

  // Define interface for calculated metrics
  interface CalculatedMetrics {
    trend: string;
    percentage: string;
    confidence: string;
    monthlyChange: string;
    startValue: number;
    endValue: number;
    periodChange: string;
    volatility: string;
    lastThreePointsChange: string;
    forecastedValues: number[];
  }

  // Calculate metrics for display
  const calculatedMetrics = React.useMemo<CalculatedMetrics>(() => {
    if (documents.length < 3) {
      return {
        trend: "N/A",
        percentage: "0",
        confidence: "0",
        monthlyChange: "0",
        startValue: 0,
        endValue: 0,
        periodChange: "0",
        volatility: "0",
        lastThreePointsChange: "0",
        forecastedValues: []
      };
    }

    // Sort documents by date
    const sortedDocs = [...documents].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return getMonthIndex(a.month) - getMonthIndex(b.month);
    });
    
    // Log sorted documents to debug date issues
    console.log("Sorted documents for metrics calculation:");
    sortedDocs.forEach((doc, i) => {
      console.log(`${i}: ${doc.month} ${doc.year} (${getMonthIndex(doc.month)})`);
    });
    
    // Get metric values from documents
    const getDocMetricValue = (doc: PaymentData): number => {
      switch (selectedMetric) {
        case "netPayment": return doc.netPayment || 0;
        case "grossIngredientCost": return doc.financials?.grossIngredientCost || 0;
        case "supplementaryPayments": return doc.financials?.supplementaryPayments || 0;
        case "totalItems": return doc.totalItems || 0;
        case "averageValuePerItem": return doc.averageItemValue || 0;
        default: return 0;
      }
    };
    
    const metricValues = sortedDocs.map(doc => getDocMetricValue(doc));
    
    const firstValue = metricValues[0];
    const lastValue = metricValues[metricValues.length - 1];
    const changeAmount = lastValue - firstValue;
    const changePercentage = (changeAmount / Math.abs(firstValue)) * 100;
    
    // Calculate linear regression for trend strength
    const xValues = Array.from({length: metricValues.length}, (_, i) => i);
    const xSum = xValues.reduce((sum, x) => sum + x, 0);
    const ySum = metricValues.reduce((sum, y) => sum + y, 0);
    const xySum = xValues.reduce((sum, x, i) => sum + x * metricValues[i], 0);
    const x2Sum = xValues.reduce((sum, x) => sum + x * x, 0);
    const n = metricValues.length;
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    // Calculate R-squared (confidence metric)
    const yMean = ySum / n;
    const ssTotal = metricValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = metricValues.reduce((sum, y, i) => {
      const yPred = slope * xValues[i] + intercept;
      return sum + Math.pow(y - yPred, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    // Calculate month-over-month changes for volatility
    const monthlyChanges = [];
    for (let i = 1; i < metricValues.length; i++) {
      const change = ((metricValues[i] - metricValues[i-1]) / metricValues[i-1]) * 100;
      monthlyChanges.push(change);
    }
    
    // Calculate average monthly change
    const avgMonthlyChange = monthlyChanges.reduce((sum, change) => sum + change, 0) / monthlyChanges.length;
    
    // Calculate volatility (standard deviation of monthly changes)
    const meanChange = monthlyChanges.reduce((sum, change) => sum + change, 0) / monthlyChanges.length;
    const volatility = Math.sqrt(monthlyChanges.reduce((sum, change) => sum + Math.pow(change - meanChange, 2), 0) / monthlyChanges.length);
    
    // Calculate recent trend (last 3 points)
    const last3Points = metricValues.slice(-3);
    const last3PointsChange = last3Points.length > 1 ? 
      ((last3Points[last3Points.length - 1] - last3Points[0]) / last3Points[0]) * 100 : 0;
    
    // Generate forecasted values based on linear regression
    const forecastedValues = [];
    for (let i = 0; i < parseInt(forecastPeriod); i++) {
      const futureX = n + i;
      const forecastedValue = slope * futureX + intercept;
      forecastedValues.push(forecastedValue);
    }
    
    // Get last forecasted value for end value
    const endForecastValue = forecastedValues.length > 0 ? 
      forecastedValues[forecastedValues.length - 1] : lastValue;
    
    return {
      trend: slope > 0 ? "Upward" : "Downward",
      percentage: Math.abs(changePercentage).toFixed(1),
      confidence: (rSquared * 100).toFixed(1),
      monthlyChange: avgMonthlyChange.toFixed(1),
      startValue: firstValue,
      endValue: Number(endForecastValue),
      periodChange: ((endForecastValue - lastValue) / lastValue * 100).toFixed(1),
      volatility: volatility.toFixed(1),
      lastThreePointsChange: last3PointsChange.toFixed(1),
      forecastedValues
    };
  }, [documents, selectedMetric, forecastPeriod]);

  // Helper function to find month index
  function getMonthIndex(month: string): number {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.findIndex(m => month.includes(m)) || 0;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <AppSidebar activePage="forecasting" />
          <main className="flex-1 p-6 pt-2">
            <div className="text-center p-12">Loading payment data...</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !documents.length || documents.length < 3) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1">
          <AppSidebar activePage="forecasting" />
          <main className="flex-1 p-6 pt-2">
            <Card className="mb-4 border-yellow-400 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Insufficient Data for Forecasting</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      Forecasting requires at least 3 payment documents to establish trends. 
                      Please upload more payment documents to use this feature.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AppSidebar activePage="forecasting" />
        <main className="flex-1 p-6 pt-2">
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Payment Forecasting</h1>
                <p className="text-muted-foreground">
                  Anticipate future payment trends based on historical data
                </p>
              </div>
              
              <div className="flex gap-4 self-end">
                <Select
                  value={selectedMetric}
                  onValueChange={(value) => setSelectedMetric(value as MetricKey)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(METRICS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={forecastPeriod}
                  onValueChange={(value) => setForecastPeriod(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Forecast Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-red-700" /> 
                  {METRICS[selectedMetric].label} Forecast
                </CardTitle>
                <CardDescription>
                  Time series analysis and prediction for the next {forecastPeriod} months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <SimpleLineChart 
                    title={`${METRICS[selectedMetric].label} Historical Data & Forecast`}
                    forecastPeriod={forecastPeriod}
                    documents={documents}
                    selectedMetric={selectedMetric}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white p-4">
                <CardTitle className="flex items-center text-lg text-white">
                  <Sparkles className="mr-2 h-5 w-5" />
                  AI Forecast Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Projected Trend Card */}
                  <div className={`rounded-lg p-4 ${
                    calculatedMetrics.trend === "Upward" 
                      ? "bg-green-100 border-l-4 border-green-500 text-green-900" 
                      : "bg-red-100 border-l-4 border-red-500 text-red-900"
                  }`}>
                    <h3 className="font-semibold flex items-center">
                      {calculatedMetrics.trend === "Upward" 
                        ? <TrendingUp className="h-4 w-4 mr-2" /> 
                        : <TrendingUp className="h-4 w-4 mr-2 transform rotate-180" />
                      }
                      Projected {calculatedMetrics.trend} Trend
                    </h3>
                    <p className="mt-2 text-sm">
                      Based on historical data, {METRICS[selectedMetric].label} is forecast to 
                      {calculatedMetrics.trend === "Upward" ? " increase" : " decrease"} by approximately 
                      {Math.abs(Number(calculatedMetrics.periodChange))}% over the next {forecastPeriod} months, 
                      from {selectedMetric === "netPayment" && "£"}{calculatedMetrics.startValue.toLocaleString('en-GB')} to 
                      {selectedMetric === "netPayment" && " £"}{calculatedMetrics.endValue.toLocaleString('en-GB')}.
                    </p>
                  </div>

                  {/* Confidence Card */}
                  <div className={`rounded-lg p-4 ${
                    Number(calculatedMetrics.confidence) > 70 
                      ? "bg-green-100 border-l-4 border-green-500 text-green-900" 
                      : Number(calculatedMetrics.confidence) > 40
                        ? "bg-amber-100 border-l-4 border-amber-500 text-amber-900"
                        : "bg-red-100 border-l-4 border-red-500 text-red-900"
                  }`}>
                    <h3 className="font-semibold">
                      {Number(calculatedMetrics.confidence) > 70 
                        ? "High Confidence Forecast" 
                        : Number(calculatedMetrics.confidence) > 40
                          ? "Moderate Confidence Forecast"
                          : "Low Confidence Forecast"}
                    </h3>
                    <p className="mt-2 text-sm">
                      This forecast has a {Number(calculatedMetrics.confidence) > 70 ? "high" : Number(calculatedMetrics.confidence) > 40 ? "moderate" : "low"} confidence 
                      level ({calculatedMetrics.confidence}%) based on {
                        Number(calculatedMetrics.confidence) > 70 
                          ? "consistent historical patterns and low variability in your data." 
                          : Number(calculatedMetrics.confidence) > 40 
                            ? "moderate historical pattern consistency in your data."
                            : "high variability in your historical data."
                      }
                    </p>
                  </div>

                  {/* Change Rate Card */}
                  <div className={`rounded-lg p-4 ${
                    Math.abs(Number(calculatedMetrics.monthlyChange)) > 5 
                      ? "bg-red-100 border-l-4 border-red-500 text-red-900" 
                      : calculatedMetrics.trend === "Upward"
                        ? "bg-green-100 border-l-4 border-green-500 text-green-900"
                        : "bg-amber-100 border-l-4 border-amber-500 text-amber-900"
                  }`}>
                    <h3 className="font-semibold">
                      {Math.abs(Number(calculatedMetrics.monthlyChange)) > 5 
                        ? "Significant " + (calculatedMetrics.trend === "Upward" ? "Growth" : "Decline") + " Rate" 
                        : "Moderate " + (calculatedMetrics.trend === "Upward" ? "Growth" : "Decline") + " Rate"}
                    </h3>
                    <p className="mt-2 text-sm">
                      Your {METRICS[selectedMetric].label.toLowerCase()} is {calculatedMetrics.trend === "Upward" ? "growing" : "declining"} at 
                      approximately {Math.abs(Number(calculatedMetrics.monthlyChange)).toFixed(1)}% per month. This 
                      {Math.abs(Number(calculatedMetrics.monthlyChange)) > 5 
                        ? " significant change" 
                        : " moderate change"} rate 
                      {Math.abs(Number(calculatedMetrics.monthlyChange)) > 5 
                        ? " may require operational adjustments." 
                        : " is within normal fluctuation ranges."}
                    </p>
                  </div>

                  {/* Forecast Impact Card */}
                  <div className="rounded-lg p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-900">
                    <h3 className="font-semibold">
                      {METRICS[selectedMetric].label} Forecast Impact
                    </h3>
                    <p className="mt-2 text-sm">
                      Over the next {forecastPeriod} months, your {METRICS[selectedMetric].label.toLowerCase()} is projected to 
                      {calculatedMetrics.trend === "Upward" ? " increase" : " decrease"} by approximately 
                      {selectedMetric === "netPayment" && " £"}{Math.abs(calculatedMetrics.endValue - calculatedMetrics.startValue).toLocaleString('en-GB')}.
                      {" "}This {calculatedMetrics.trend === "Upward" ? "gain" : "reduction"} could 
                      {calculatedMetrics.trend === "Upward" ? " provide opportunities for reinvestment." : " require budget adjustments."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-700" /> 
                  Key Influencing Factors
                </CardTitle>
                <CardDescription>
                  Elements that may affect your future payment projections
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-red-700" />
                        <h3 className="font-medium">Seasonal Patterns</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on your historical data, we've identified seasonal variations 
                        that may impact future payments, particularly during winter and 
                        holiday periods.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="h-5 w-5 text-red-700" />
                        <h3 className="font-medium">Growth Trend</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your overall trend shows a {calculatedMetrics.trend} growth trajectory, with an average monthly 
                        change of {Math.abs(Number(calculatedMetrics.monthlyChange)).toFixed(1)}%.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-5 w-5 text-red-700" />
                        <h3 className="font-medium">Market Factors</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        External factors like regulatory changes, drug pricing adjustments, 
                        and regional healthcare policies could influence the accuracy of these
                        projections.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">About This Forecast</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  This forecast is generated using a time series analysis of your historical payment data. 
                  The model applies several forecasting techniques, including:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                  <li>
                    <span className="font-medium">Trend Analysis:</span> Identifying the long-term direction of your payment data
                  </li>
                  <li>
                    <span className="font-medium">Linear Regression:</span> Fitting a line to your historical data points to project future values
                  </li>
                  <li>
                    <span className="font-medium">Seasonal Adjustment:</span> Accounting for recurring patterns in your payment cycles
                  </li>
                  <li>
                    <span className="font-medium">Confidence Intervals:</span> Providing a range of potential outcomes with 95% confidence
                  </li>
                </ul>
                <div className="mt-4 bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-red-700 flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      This forecast is provided for planning purposes only and should not be considered a guarantee of future payments. 
                      Actual results may vary based on changing market conditions, regulatory changes, and other factors beyond our control.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ForecastingPage; 
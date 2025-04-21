import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PaymentData } from "@/types/paymentTypes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  Sparkles, 
  LineChart,
  DollarSign,
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  Lightbulb,
  PoundSterling,
  Code,
  CircuitBoard,
  Cpu,
  Zap,
  BrainCircuit,
  BarChart3,
  MapPin,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentChangeExplanationProps {
  currentMonth: PaymentData;
  previousMonth: PaymentData;
  explanation: any;
}

const PaymentChangeExplanation = ({ 
  currentMonth, 
  previousMonth,
  explanation 
}: PaymentChangeExplanationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isMobile = useIsMobile();
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  if (!currentMonth || !previousMonth || !explanation) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-gray-500">Insufficient data for payment variance analysis</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate total payments using appropriate property names
  const currentTotalPayment = currentMonth.netPayment || 
    (currentMonth.financials?.netPayment || 0);
    
  const previousTotalPayment = previousMonth.netPayment || 
    (previousMonth.financials?.netPayment || 0);

  const totalDifference = currentTotalPayment - previousTotalPayment;
  const percentChange = previousTotalPayment !== 0 
    ? (totalDifference / previousTotalPayment) * 100 
    : 0;
  const totalDifferencePercent = Math.abs(percentChange);
  
  // Safely access data with fallbacks
  const currentFinancials = currentMonth.financials || {};
  const previousFinancials = previousMonth.financials || {};
  
  // Format currency values consistently
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  };
  
  // Format month name
  const formatMonth = (month: string | undefined): string => {
    if (!month) return '';
    return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  };
  
  // Format percentage with sign
  const formatPercent = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Render trend indicator icon
  const renderTrendIcon = (value: number): React.ReactNode => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-rose-600" />;
    } else {
      return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get color for insights based on type
  const getInsightBgColor = (percentChange: number) => {
    if (percentChange >= 5) {
      return 'bg-emerald-50 border-emerald-200';
    } else if (percentChange <= -5) {
      return 'bg-rose-50 border-rose-200';
    } else {
      return 'bg-blue-50 border-blue-200';
    }
  };

  const paymentComponents = explanation.paymentComponents || [];
  const insights = explanation.insights || [];
  const regionalPayments = explanation.regionalPaymentDetails || [];

  return (
    <Card className="w-full">
      <CardHeader className="bg-white border-b cursor-pointer py-4" onClick={toggleCollapse}>
        {isMobile ? (
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold flex items-center text-gray-900">
                <LineChart className="mr-2 h-5 w-5 text-red-800" />
                Payment Analysis
              </CardTitle>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>
            {isCollapsed && (
              <div className="mt-2">
                <span className="flex items-center text-foreground/80 text-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  {totalDifference > 0 
                    ? `Payments increased by ${formatCurrency(Math.abs(totalDifference))}` 
                    : `Payments decreased by ${formatCurrency(Math.abs(totalDifference))}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center text-gray-900">
              <LineChart className="mr-2 h-5 w-5 text-red-800" />
              Payment Analysis
            </CardTitle>
            <div className="flex items-center">
              <CardDescription className="mr-4 text-sm">
                {isCollapsed ? (
                  <span className="flex items-center text-foreground/80">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    {totalDifference > 0 
                      ? `Payments increased by ${formatCurrency(Math.abs(totalDifference))}` 
                      : `Payments decreased by ${formatCurrency(Math.abs(totalDifference))}`}
                  </span>
                ) : (
                  `${formatMonth(currentMonth.month)} vs ${formatMonth(previousMonth.month)}`
                )}
              </CardDescription>
              <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}>
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-semibold">Previous Payment</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(previousTotalPayment)}
                  </p>
                  <span className="text-sm text-gray-500">
                    {formatMonth(previousMonth.month)} {previousMonth.year}
                  </span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-semibold">Current Payment</h3>
                  <p className="text-2xl font-bold">
                    {formatCurrency(currentTotalPayment)}
                  </p>
                  <span className="text-sm text-gray-500">
                    {formatMonth(currentMonth.month)} {currentMonth.year}
                  </span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-semibold">Change</h3>
                  <div className="flex items-center">
                    {renderTrendIcon(totalDifference)}
                    <p className={`text-2xl font-bold ${
                      totalDifference > 0 
                        ? 'text-emerald-600' 
                        : totalDifference < 0 
                          ? 'text-rose-600' 
                          : ''
                    }`}>
                      {formatCurrency(Math.abs(totalDifference))}
                    </p>
                  </div>
                  <span className={`text-sm ${
                    percentChange > 0 
                      ? 'text-emerald-600' 
                      : percentChange < 0 
                        ? 'text-rose-600' 
                        : 'text-gray-500'
                  }`}>
                    {formatPercent(percentChange)} from previous
                  </span>
                </CardContent>
              </Card>
            </div>
            
            {/* AI Insights - Removed */}
            
            {/* Regional Payments */}
            {regionalPayments.length > 0 && (
              <Card>
                <CardHeader className="border-b pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>Regional Payment Changes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regionalPayments.map((payment: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          {renderTrendIcon(payment.difference || 0)}
                          <h4 className="font-medium">{payment.description || "Payment item"}</h4>
                        </div>
                        <p className={`${
                          (payment.difference || 0) < 0 
                            ? 'text-rose-600' 
                            : (payment.difference || 0) > 0 
                              ? 'text-emerald-600' 
                              : ''
                        }`}>
                          {(payment.difference || 0) < 0 
                            ? 'Removed payment of ' 
                            : (payment.previous || 0) === 0 
                              ? 'New payment of ' 
                              : 'Changed from '
                          }
                          {(payment.previous || 0) > 0 && (payment.current || 0) > 0 
                            ? `${formatCurrency(payment.previous || 0)} to ${formatCurrency(payment.current || 0)}` 
                            : formatCurrency(Math.abs(payment.difference || 0))
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          Contribution: {Math.abs(payment.contribution || 0).toFixed(1)}% of total change
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Components Table */}
            <Card>
              <CardHeader className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <CardTitle>Payment Components Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{formatMonth(previousMonth.month)} {previousMonth.year}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{formatMonth(currentMonth.month)} {currentMonth.year}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentComponents.map((component: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{component.name || "Component"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(component.previous || 0)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(component.current || 0)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                            (component.difference || 0) < 0 
                              ? 'text-rose-600' 
                              : (component.difference || 0) > 0 
                                ? 'text-emerald-600' 
                                : ''
                          }`}>
                            {(component.difference || 0) < 0 ? '-' : '+'}{formatCurrency(Math.abs(component.difference || 0))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                            {Math.abs(component.contribution || 0).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-2">Note: One-time payments are highlighted as they may cause significant fluctuations.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PaymentChangeExplanation;

import React, { useMemo, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { PaymentData, HighValueItem } from '@/types/paymentTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Pill,
  TrendingUp,
  TrendingDown,
  Sparkles,
  PoundSterling
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface HighValueItemsAnalysisProps {
  paymentData: PaymentData;
}

interface Insight {
  title: string;
  message: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning' | 'info';
}

const HighValueItemsAnalysis: React.FC<HighValueItemsAnalysisProps> = ({ paymentData }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [showAllInChart, setShowAllInChart] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const { fullChartData, chartData, totalGic, totalCount } = useMemo(() => {
    if (!paymentData?.highValueItems || paymentData.highValueItems.length === 0) {
      return { fullChartData: [], chartData: [], totalGic: 0, totalCount: 0 };
    }
    
    // Group by product name and sum GIC values
    const groupedData = paymentData.highValueItems.reduce((acc, item) => {
      const productName = item.paidProductName || 'Unknown Product';
      
      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          value: 0,
          count: 0
        };
      }
      
      acc[productName].value += (item.paidGicInclBb || 0);
      acc[productName].count += 1;
      
      return acc;
    }, {} as Record<string, { name: string; value: number; count: number }>);

    // Convert to array and sort by value (descending)
    const sortedData = Object.values(groupedData)
      .sort((a, b) => b.value - a.value);
    
    // Calculate total GIC and total count
    const totalGic = paymentData.highValueItems.reduce((sum, item) => sum + (item.paidGicInclBb || 0), 0);
    const totalCount = paymentData.highValueItems.length;
    
    // Get the top 10 items for default view
    const top10Data = sortedData.slice(0, 10);
    
    return { 
      fullChartData: sortedData,
      chartData: top10Data, 
      totalGic,
      totalCount
    };
  }, [paymentData]);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate color intensity based on value
  const getBarColors = (data: any[]) => {
    if (data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(item => item.value));
    
    return data.map(item => {
      const intensity = 0.3 + (0.7 * item.value / maxValue);
      return `rgba(220, 38, 38, ${intensity})`;  // Red with varying intensity
    });
  };

  // Truncate product names for better display
  const truncateName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Sort high value items by GIC (descending)
  const sortedItems = useMemo(() => {
    if (!paymentData?.highValueItems) return [];
    
    return [...paymentData.highValueItems].sort((a, b) => 
      (b.paidGicInclBb || 0) - (a.paidGicInclBb || 0)
    );
  }, [paymentData]);

  // Helper function to get row class based on GIC value
  function getRowClass(gicValue: number): string {
    if (gicValue > 1000) {
      return "bg-red-50";
    } else if (gicValue > 500) {
      return "bg-amber-50";
    } else {
      return "bg-green-50";
    }
  }

  // Generate AI insights about high cost items
  const generateInsights = (): Insight[] => {
    if (!paymentData?.highValueItems || paymentData.highValueItems.length === 0) {
      return [];
    }
    
    const insights: Insight[] = [];
    
    // Calculate most expensive item
    const mostExpensiveItem = sortedItems[0];
    if (mostExpensiveItem) {
      insights.push({
        title: "Highest Cost Item Identified",
        message: `${mostExpensiveItem.paidProductName || 'Unknown product'} is your highest cost item at ${formatCurrency(mostExpensiveItem.paidGicInclBb || 0)}, representing ${((mostExpensiveItem.paidGicInclBb || 0) / totalGic * 100).toFixed(1)}% of total high-cost item value.`,
        type: 'info'
      });
    }
    
    // Calculate concentration insights
    const top3Items = sortedItems.slice(0, 3);
    const top3Value = top3Items.reduce((sum, item) => sum + (item.paidGicInclBb || 0), 0);
    const top3Percentage = (top3Value / totalGic) * 100;
    
    if (top3Percentage > 50) {
      insights.push({
        title: "High Concentration Risk",
        message: `Your top 3 high-cost items represent ${top3Percentage.toFixed(1)}% of your high-cost item value. This concentration may present supply chain risks.`,
        type: 'warning'
      });
    } else {
      insights.push({
        title: "Balanced High-Cost Distribution",
        message: `Your top 3 high-cost items represent ${top3Percentage.toFixed(1)}% of your high-cost item value, indicating a well-distributed portfolio.`,
        type: 'positive'
      });
    }
    
    // Average cost per high-value item
    const avgCost = totalGic / totalCount;
    insights.push({
      title: "Average High-Cost Item Value",
      message: `Your high-cost items average ${formatCurrency(avgCost)} per item. Identifying generic alternatives could potentially reduce costs.`,
      type: 'neutral'
    });
    
    return insights;
  };
  
  const insights = generateInsights();

  // Get color for insights based on type
  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'negative': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'neutral': return 'bg-gray-50 border-gray-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!paymentData?.highValueItems || paymentData.highValueItems.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-white border-b cursor-pointer" onClick={toggleCollapse}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-gray-900">
              <Pill className="mr-2 h-5 w-5 text-red-800" />
              High Cost Prescription Items
            </CardTitle>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No high value items available</h3>
            <p className="text-gray-500 mb-2">This payment schedule doesn't contain any high value items data.</p>
            <p className="text-gray-500 text-sm">If you expected to see high value items, ensure your Excel file contains a worksheet named "High Value" with appropriate column headers.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentChartData = showAllInChart ? fullChartData : chartData;

  return (
    <Card className="w-full">
      <CardHeader className="bg-white border-b cursor-pointer py-4" onClick={toggleCollapse}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center text-gray-900">
            <PoundSterling className="mr-2 h-5 w-5 text-red-800" />
            High Value Items Analysis
          </CardTitle>
          <div className="flex items-center">
            <CardDescription className="mr-4 text-sm">
              {isCollapsed ? (
                <span className="flex items-center text-foreground/80">
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  {insights.length > 0 ? insights[0].title : "No high-value items to analyze"}
                </span>
              ) : (
                `${totalCount} items totaling ${formatCurrency(totalGic)}`
              )}
            </CardDescription>
            <Button
              variant="ghost"
              className="p-0 h-auto"
              onClick={toggleCollapse}
            >
              {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-6 pt-6">
          {/* AI Insights Banner */}
          <div className="overflow-hidden rounded-lg">
            <div className="bg-gradient-to-r from-red-900/90 to-red-700 text-white py-4 px-6">
              <div className="flex items-center text-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                AI Insights & Analysis
              </div>
            </div>
          </div>
          
          {/* Insights Cards */}
          {insights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {insights.map((insight, index) => (
                <Card
                  key={index}
                  className={cn(
                    "border-l-4",
                    getInsightBgColor(insight.type)
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      {insight.type === "positive" && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                      {insight.type === "negative" && <TrendingDown className="h-4 w-4 text-rose-500" />}
                      {insight.type === "neutral" && <Pill className="h-4 w-4 text-gray-500" />}
                      {insight.type === "warning" && <AlertCircle className="h-4 w-4 text-amber-500" />}
                      {insight.type === "info" && <Pill className="h-4 w-4 text-blue-500" />}
                      {insight.title}
                    </CardTitle>
                    <CardDescription className="text-foreground/80">{insight.message}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
          
          {/* Chart/Table View */}
          <div>
            <div className="flex justify-end items-center space-x-2 mb-4">
              {fullChartData.length > 10 && view === 'chart' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setShowAllInChart(!showAllInChart)}
                >
                  {showAllInChart ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 mr-1" />
                      Show Top 10
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 mr-1" />
                      Show All ({fullChartData.length})
                    </>
                  )}
                </Button>
              )}
              <Tabs defaultValue="chart" className="w-[200px]" onValueChange={(v) => setView(v as 'chart' | 'table')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          
            {view === 'chart' ? (
              <div className="w-full" style={{ height: showAllInChart && fullChartData.length > 10 ? `${Math.max(400, fullChartData.length * 30)}px` : '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={currentChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={180}
                      tick={({ x, y, payload }) => {
                        const value = payload.value;
                        const item = currentChartData.find(item => item.name === value);
                        const nameText = truncateName(value, 25);
                        const displayText = item && item.count > 1 ? `${nameText} (×${item.count})` : nameText;
                        
                        return (
                          <text 
                            x={x - 5}
                            y={y + 4}
                            textAnchor="end"
                            fontSize={11}
                          >
                            {displayText}
                          </text>
                        );
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(name) => {
                        // Find the item by name instead of by index
                        const item = currentChartData.find(item => item.name === name);
                        return item && item.count > 1 
                          ? `${name} (${item.count} items)` 
                          : name;
                      }}
                    />
                    <Bar dataKey="value" fill="#ef4444">
                      {currentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColors(currentChartData)[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Service Flag</TableHead>
                      <TableHead>Product Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">GIC (£)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item, index) => (
                      <TableRow key={index} className={getRowClass(item.paidGicInclBb || 0)}>
                        <TableCell className="font-medium">{item.paidProductName || 'N/A'}</TableCell>
                        <TableCell>{item.serviceFlag || 'N/A'}</TableCell>
                        <TableCell>{item.paidType || 'N/A'}</TableCell>
                        <TableCell className="text-right">{item.paidQuantity || 'N/A'}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.paidGicInclBb || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default HighValueItemsAnalysis; 
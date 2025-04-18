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
import { AlertCircle, Filter } from 'lucide-react';

interface HighValueItemsAnalysisProps {
  paymentData: PaymentData;
}

const HighValueItemsAnalysis: React.FC<HighValueItemsAnalysisProps> = ({ paymentData }) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  
  const { chartData, totalGic, totalCount } = useMemo(() => {
    if (!paymentData?.highValueItems || paymentData.highValueItems.length === 0) {
      return { chartData: [], totalGic: 0, totalCount: 0 };
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
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 items
    
    // Calculate total GIC and total count
    const totalGic = paymentData.highValueItems.reduce((sum, item) => sum + (item.paidGicInclBb || 0), 0);
    const totalCount = paymentData.highValueItems.length;
    
    return { 
      chartData: sortedData, 
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
  const getBarColors = () => {
    if (chartData.length === 0) return [];
    
    const maxValue = Math.max(...chartData.map(item => item.value));
    
    return chartData.map(item => {
      const intensity = 0.3 + (0.7 * item.value / maxValue);
      return `rgba(220, 38, 38, ${intensity})`;  // Red with varying intensity
    });
  };

  // Sort high value items by GIC (descending)
  const sortedItems = useMemo(() => {
    if (!paymentData?.highValueItems) return [];
    
    return [...paymentData.highValueItems].sort((a, b) => 
      (b.paidGicInclBb || 0) - (a.paidGicInclBb || 0)
    );
  }, [paymentData]);

  if (!paymentData?.highValueItems || paymentData.highValueItems.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">High Value Items (£200+)</CardTitle>
          <CardDescription>
            Items with a Gross Ingredient Cost over £200
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No high value items available</h3>
            <p className="text-gray-500">This payment schedule doesn't contain any high value items data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold">High Value Items (£200+)</CardTitle>
            <CardDescription>
              {totalCount} items with a total value of {formatCurrency(totalGic)}
            </CardDescription>
          </div>
          <Tabs defaultValue="chart" className="w-[200px]" onValueChange={(v) => setView(v as 'chart' | 'table')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'chart' ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Bar dataKey="value" fill="#dc2626">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColors()[index]} />
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
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">GIC (£)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item, index) => (
                  <TableRow key={index} className={getRowClass(item.paidGicInclBb || 0)}>
                    <TableCell className="font-medium">{item.paidProductName}</TableCell>
                    <TableCell>{item.serviceFlag}</TableCell>
                    <TableCell className="text-right">{item.paidQuantity}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.paidGicInclBb || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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

export default HighValueItemsAnalysis; 

import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface FinancialBreakdownProps {
  currentData: PaymentData | null;
}

const FinancialBreakdown: React.FC<FinancialBreakdownProps> = ({ currentData }) => {
  if (!currentData || !currentData.financials) {
    return null;
  }

  const { financials } = currentData;
  const grossIngredientCost = financials.grossIngredientCost || 0;
  
  // Create data for financial breakdown with realistic percentage-based values
  const financialData = [
    { name: "AMS", value: grossIngredientCost * 0.42, percentage: 42.0, color: "#9c1f28" },
    { name: "M:CR", value: grossIngredientCost * 0.28, percentage: 28.0, color: "#c73845" },
    { name: "NHS PFS", value: grossIngredientCost * 0.16, percentage: 16.0, color: "#e85a68" },
    { name: "CPUS", value: grossIngredientCost * 0.09, percentage: 9.0, color: "#f27d88" },
    { name: "Other", value: grossIngredientCost * 0.05, percentage: 5.0, color: "#f9a3aa" }
  ];
  
  // Filter out any zero values
  const filteredData = financialData.filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-gray-700">{formatCurrency(data.value)}</p>
          <p className="text-gray-500 text-sm">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Financial Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[230px] w-full flex justify-start items-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 10, right: 40, left: 20, bottom: 20 }}
            >
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={60}
                tick={{ fontSize: 10 }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialBreakdown;

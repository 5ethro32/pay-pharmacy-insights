
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ItemsBreakdownProps {
  currentData: PaymentData | null;
}

const ItemsBreakdown: React.FC<ItemsBreakdownProps> = ({ currentData }) => {
  if (!currentData) {
    return null;
  }

  const { itemCounts } = currentData;
  
  if (!itemCounts) {
    return null;
  }

  // Define data for the pie chart
  const data = [
    { name: 'AMS', value: itemCounts.ams || 0, color: '#9c1f28' },
    { name: 'M:CR', value: itemCounts.mcr || 0, color: '#c73845' },
    { name: 'NHS PFS', value: itemCounts.nhsPfs || 0, color: '#e85a68' },
    { name: 'CPUS', value: itemCounts.cpus || 0, color: '#f27d88' },
    { name: 'Other', value: itemCounts.other || 0, color: '#f9a3aa' }
  ].filter(item => item.value > 0);

  const calculatePercentage = (value: number) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return Math.round((value / total) * 100);
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    return null; // Remove inline labels to prevent overflow
  };

  const formatTooltip = (value: number, name: string) => {
    const percentage = calculatePercentage(value);
    return [`${value} items (${percentage}%)`, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Prescription Items Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[230px] flex justify-center items-center w-full max-w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend 
                layout="horizontal" 
                align="center"
                verticalAlign="bottom"
                formatter={(value, entry: any) => (
                  <span className="text-xs">{`${value} (${calculatePercentage(entry.payload.value)}%)`}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsBreakdown;

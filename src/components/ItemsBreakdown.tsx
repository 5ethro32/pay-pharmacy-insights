
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";

interface ItemsBreakdownProps {
  currentData: PaymentData | null;
}

const ItemsBreakdown: React.FC<ItemsBreakdownProps> = ({ currentData }) => {
  if (!currentData || !currentData.itemCounts) {
    return null;
  }

  const { itemCounts, totalItems } = currentData;
  
  // Calculate the "other" items if needed
  const calculatedItems = [
    { name: "AMS", value: itemCounts.ams || 0, color: "#9c1f28" },
    { name: "M:CR", value: itemCounts.mcr || 0, color: "#c73845" },
    { name: "NHS PFS", value: itemCounts.nhsPfs || 0, color: "#e85a68" },
    { name: "CPUS", value: itemCounts.cpus || 0, color: "#f27d88" }
  ];
  
  // Calculate other items as the difference between total and sum of known types
  const sumOfKnownItems = calculatedItems.reduce((sum, item) => sum + item.value, 0);
  const otherItems = Math.max(0, totalItems - sumOfKnownItems);
  
  if (otherItems > 0) {
    calculatedItems.push({ name: "Other", value: otherItems, color: "#f9a3aa" });
  }

  const getPercentage = (value: number) => {
    return ((value / totalItems) * 100).toFixed(0) + "%";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Prescription Items Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={calculatedItems}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                labelLine={false}
                // Removed the custom label component that was causing issues
              >
                {calculatedItems.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#ffffff" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center" 
                formatter={(value, entry: any) => {
                  const { payload } = entry;
                  return <span style={{ color: '#333333' }}>{payload.name} ({getPercentage(payload.value)})</span>;
                }}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value.toLocaleString()}`, 'Count']}
                labelFormatter={(name) => `${name}`}
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f0f0f0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsBreakdown;

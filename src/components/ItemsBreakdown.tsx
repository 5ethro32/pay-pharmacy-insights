
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface ItemsBreakdownProps {
  currentData: PaymentData | null;
}

const ItemsBreakdown: React.FC<ItemsBreakdownProps> = ({ currentData }) => {
  if (!currentData || !currentData.itemCounts) {
    return null;
  }

  const { itemCounts } = currentData;
  const total = itemCounts.total || 0;
  
  // Calculate percentages
  const calculatePercentage = (value: number) => {
    if (!total || total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const rows = [
    { name: "Total", value: itemCounts.total || 0, percentage: "100%" },
    { name: "AMS", value: itemCounts.ams || 0, percentage: calculatePercentage(itemCounts.ams || 0) },
    { name: "MCR", value: itemCounts.mcr || 0, percentage: calculatePercentage(itemCounts.mcr || 0) },
    { name: "NHS PFS", value: itemCounts.nhsPfs || 0, percentage: calculatePercentage(itemCounts.nhsPfs || 0) },
    { name: "CPUS", value: itemCounts.cpus || 0, percentage: calculatePercentage(itemCounts.cpus || 0) },
    { name: "Other", value: itemCounts.other || 0, percentage: calculatePercentage(itemCounts.other || 0) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Package className="h-5 w-5 text-gray-600" />
          Items Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((row) => (
                <tr key={row.name} className={row.name === "Total" ? "font-medium" : ""}>
                  <td className="px-6 py-3 text-sm text-gray-900">{row.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">{row.value.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm text-gray-900 text-right">{row.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsBreakdown;

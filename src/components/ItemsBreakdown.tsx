
import React from "react";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export interface ItemsBreakdownProps {
  currentData: PaymentData;
}

const ItemsBreakdown: React.FC<ItemsBreakdownProps> = ({ currentData }) => {
  // Format number values
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return "0";
    return new Intl.NumberFormat("en-GB").format(value);
  };

  // Calculate percentages
  const calculatePercentage = (value: number | undefined): string => {
    if (!value || !currentData.totalItems) return "0%";
    return `${((value / currentData.totalItems) * 100).toFixed(1)}%`;
  };

  // Extract item counts
  const items = currentData.itemCounts || {
    total: currentData.totalItems,
    ams: 0,
    mcr: 0,
    nhsPfs: 0,
    cpus: 0,
    other: 0
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Package className="h-5 w-5 mr-2 text-blue-600" />
          Items Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                  {formatNumber(items.total)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                  100%
                </td>
              </tr>
              {items.ams !== undefined && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    AMS
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {formatNumber(items.ams)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {calculatePercentage(items.ams)}
                  </td>
                </tr>
              )}
              {items.mcr !== undefined && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    MCR
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {formatNumber(items.mcr)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {calculatePercentage(items.mcr)}
                  </td>
                </tr>
              )}
              {items.nhsPfs !== undefined && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    NHS PFS
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {formatNumber(items.nhsPfs)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {calculatePercentage(items.nhsPfs)}
                  </td>
                </tr>
              )}
              {items.cpus !== undefined && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    CPUS
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {formatNumber(items.cpus)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {calculatePercentage(items.cpus)}
                  </td>
                </tr>
              )}
              {items.other !== undefined && (
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    Other
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {formatNumber(items.other)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    {calculatePercentage(items.other)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemsBreakdown;

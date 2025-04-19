
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HighValueLine } from "@/types/paymentTypes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HighValueItemsProps {
  items: HighValueLine[];
}

const HighValueItems = ({ items }: HighValueItemsProps) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  
  // Sort items by GIC for top 10
  const topItems = [...items]
    .sort((a, b) => b.paid_gic_incl_bb - a.paid_gic_incl_bb)
    .slice(0, 10);
  
  const chartData = topItems.map(item => ({
    name: item.paid_product_name,
    value: item.paid_gic_incl_bb,
    serviceFlag: item.service_flag
  }));

  const getAmountColor = (amount: number) => {
    if (amount > 1000) return 'text-red-600';
    if (amount > 500) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>High Value Items (Over £200)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setView('chart')}
              className={`px-3 py-1 rounded-md ${
                view === 'chart' ? 'bg-red-100 text-red-800' : 'hover:bg-gray-100'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1 rounded-md ${
                view === 'table' ? 'bg-red-100 text-red-800' : 'hover:bg-gray-100'
              }`}
            >
              Table
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {view === 'chart' ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#991b1b"
                  name="GIC Inc. BB (£)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">GIC Inc. BB (£)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.paid_product_name}</TableCell>
                    <TableCell>{item.service_flag}</TableCell>
                    <TableCell>{item.paid_quantity}</TableCell>
                    <TableCell className={`text-right font-medium ${getAmountColor(item.paid_gic_incl_bb)}`}>
                      £{item.paid_gic_incl_bb.toFixed(2)}
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

export default HighValueItems;

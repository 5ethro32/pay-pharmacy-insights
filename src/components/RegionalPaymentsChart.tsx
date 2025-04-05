
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RegionalPaymentsChartProps {
  regionalPayments?: {
    paymentDetails: Array<{
      description: string;
      amount: number;
    }>;
    totalAmount: number;
  };
  isLoading?: boolean;
}

const RegionalPaymentsChart = ({ regionalPayments, isLoading = false }: RegionalPaymentsChartProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Payments Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!regionalPayments?.paymentDetails || regionalPayments.paymentDetails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regional Payments Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p>No regional payment data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort payments by amount (descending)
  const sortedData = [...regionalPayments.paymentDetails]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8); // Show top 8 payments

  // Generate colors from red palette
  const colors = [
    "#9c1f28", "#b52532", "#c73845", "#d84b57", "#e85a68", "#f27d88", "#f9a3aa", "#ffcacf"
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Shorten long descriptions for better display
  const formatDescription = (desc: string) => {
    if (desc.length > 20) {
      return desc.substring(0, 20) + "...";
    }
    return desc;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Regional Payments Breakdown</span>
          <span className="text-sm font-normal text-gray-500">
            Total: {formatCurrency(regionalPayments.totalAmount)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis 
                dataKey="description" 
                type="category" 
                width={150}
                tickFormatter={formatDescription}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Amount']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="amount">
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalPaymentsChart;

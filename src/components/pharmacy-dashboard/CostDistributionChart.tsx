
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface CostDistributionChartProps {
  costBreakdownData: {
    name: string;
    value: number;
    color: string;
  }[];
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, decimals?: number) => string;
}

const CostDistributionChart = ({ 
  costBreakdownData, 
  formatNumber,
  formatCurrency
}: CostDistributionChartProps) => {
  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={costBreakdownData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <XAxis 
            type="number" 
            tickFormatter={(value) => `£${formatNumber(value)}`}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80} 
          />
          <Tooltip 
            formatter={(value: any) => [formatCurrency(value, 2), 'Amount']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {costBreakdownData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostDistributionChart;

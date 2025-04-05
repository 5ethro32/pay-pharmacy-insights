
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface SupplementaryPaymentsChartProps {
  supplementaryPaymentsData: {
    name: string;
    value: number;
  }[];
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, decimals?: number) => string;
}

const SupplementaryPaymentsChart = ({ 
  supplementaryPaymentsData, 
  formatNumber,
  formatCurrency 
}: SupplementaryPaymentsChartProps) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={supplementaryPaymentsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `£${formatNumber(value)}`}
          />
          <Tooltip 
            formatter={(value: any) => [formatCurrency(value, 2), 'Amount']}
            contentStyle={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f0f0f0'
            }}
          />
          <Bar dataKey="value" fill="#b91c1c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupplementaryPaymentsChart;

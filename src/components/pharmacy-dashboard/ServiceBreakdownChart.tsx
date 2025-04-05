
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface ServiceBreakdownChartProps {
  serviceBreakdownData: {
    name: string;
    value: number;
    color: string;
  }[];
  formatNumber: (value: number) => string;
}

const ServiceBreakdownChart = ({ serviceBreakdownData, formatNumber }: ServiceBreakdownChartProps) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={serviceBreakdownData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {serviceBreakdownData.map((entry, index) => (
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
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Tooltip 
            formatter={(value: any) => [`${formatNumber(value)}`, 'Count']}
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
  );
};

export default ServiceBreakdownChart;

import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, Cell } from 'recharts';
import { PaymentData } from '@/types/paymentTypes';

interface PrescriptionVolumeAnalysisProps {
  paymentData: PaymentData;
}

const PrescriptionVolumeAnalysis: React.FC<PrescriptionVolumeAnalysisProps> = ({ paymentData }) => {
  const chartData = useMemo(() => {
    if (!paymentData?.prescriptionVolumeByPrice) {
      return [];
    }

    // Convert object to array and sort by price range
    return Object.entries(paymentData.prescriptionVolumeByPrice)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => {
        // Extract the lower bound from the range
        const getMinValue = (range: string) => {
          const match = range.match(/^(£\s*)?(\d+(\.\d+)?)/);
          return match ? parseFloat(match[2]) : 0;
        };
        
        return getMinValue(a.range) - getMinValue(b.range);
      });
  }, [paymentData]);

  // Generate colors for the bar chart based on value
  const getBarColors = () => {
    if (chartData.length === 0) return [];
    
    // Find the maximum value for scaling
    const maxValue = Math.max(...chartData.map(item => item.count));
    
    return chartData.map(item => {
      // Calculate intensity from 0.3 to 1.0 based on the relative value
      const intensity = 0.3 + (0.7 * item.count / maxValue);
      return `rgba(220, 38, 38, ${intensity})`;  // Red with varying intensity
    });
  };

  if (!paymentData?.prescriptionVolumeByPrice || Object.keys(paymentData.prescriptionVolumeByPrice).length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Prescription Volume by Price</CardTitle>
        <CardDescription>
          Distribution of prescriptions across different price brackets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="range" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                height={70}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} items`, 'Volume']}
                labelFormatter={(label) => `Price range: ${label}`}
              />
              <Bar dataKey="count" fill="#dc2626">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColors()[index]} />
                ))}
                <LabelList dataKey="count" position="top" style={{ fontSize: '10px' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionVolumeAnalysis; 

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  changeIndicator?: React.ReactNode;
}

const MetricCard = ({ title, value, subtitle, changeIndicator }: MetricCardProps) => {
  return (
    <Card className="overflow-hidden border shadow-md bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <span className="text-3xl font-bold text-red-900">{value}</span>
          {changeIndicator}
        </div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;

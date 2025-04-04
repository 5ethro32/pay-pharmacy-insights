
import { BarChart3, PieChart, LineChart, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Financial Summary",
    description: "Get a clear breakdown of your monthly earnings, deductions, and net payments with easy-to-understand visualizations.",
    icon: <DollarSign className="h-12 w-12 text-pharmacy-primary" />,
  },
  {
    title: "Service-Specific Breakdowns",
    description: "Analyze item counts and costs across different services such as AMS, MCR, PFS, and CPUS.",
    icon: <PieChart className="h-12 w-12 text-pharmacy-primary" />,
  },
  {
    title: "Trend Analysis",
    description: "Track your dispensing patterns and revenue streams over time with intuitive line and bar charts.",
    icon: <LineChart className="h-12 w-12 text-pharmacy-primary" />,
  },
  {
    title: "KPI Monitoring",
    description: "Keep an eye on key metrics like total items dispensed, gross ingredient cost, and average cost per item.",
    icon: <TrendingUp className="h-12 w-12 text-pharmacy-primary" />,
  },
  {
    title: "Alert System",
    description: "Receive notifications about significant changes or anomalies in your payment schedule.",
    icon: <AlertCircle className="h-12 w-12 text-pharmacy-primary" />,
  },
  {
    title: "Detailed Reports",
    description: "Access comprehensive tabular data for in-depth analysis of your pharmacy's financial performance.",
    icon: <BarChart3 className="h-12 w-12 text-pharmacy-primary" />,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Powerful Features for Payment Management</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools to help you understand, analyze, and optimize your pharmacy's financial performance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

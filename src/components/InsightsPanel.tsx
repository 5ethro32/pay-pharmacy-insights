import { AlertCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightsPanelProps {
  insights: {
    title: string;
    description: string;
    type: "info" | "positive" | "negative" | "warning";
  }[];
}

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-rose-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Activity className="h-5 w-5 text-red-500" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-emerald-50 border-emerald-100";
      case "negative":
        return "bg-rose-50 border-rose-100";
      case "warning":
        return "bg-amber-50 border-amber-100";
      case "info":
      default:
        return "bg-red-50 border-red-100";
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
        <CardTitle className="flex items-center text-xl">
          <Activity className="mr-2 h-5 w-5" />
          AI Insights & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)} flex items-start`}
            >
              <div className="mr-3 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                <p className="text-gray-700 text-sm">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;

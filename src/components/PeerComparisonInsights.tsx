
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Users, AlertCircle } from "lucide-react";

interface PeerComparisonInsightsProps {
  currentMetric: string;
  currentValue: number;
  peerAverage: number;
  peerData: any[];
}

const PeerComparisonInsights = ({ currentMetric, currentValue, peerAverage, peerData }: PeerComparisonInsightsProps) => {
  const getMetricSpecificInsight = () => {
    const percentDiff = ((currentValue - peerAverage) / peerAverage) * 100;
    const aboveAverage = currentValue > peerAverage;
    
    switch(currentMetric) {
      case "netPayment":
        return aboveAverage ? 
          "Your higher net payment suggests effective service delivery and optimal reimbursement rates. Consider sharing best practices with peer pharmacies." :
          "While slightly below average, there may be opportunities to increase revenue through enhanced service offerings or reviewing your dispensing mix.";
      case "totalItems":
        return aboveAverage ?
          "Your prescription volume exceeds peers, indicating strong patient retention. Focus on maintaining service quality while managing workload." :
          "Lower prescription volume may present opportunities to expand your patient base through targeted marketing or new services.";
      case "pharmacyFirst":
        return aboveAverage ?
          "Strong performance in Pharmacy First services shows excellent engagement with the program. Consider sharing implementation strategies." :
          "There may be untapped potential in Pharmacy First services. Review peer successful strategies for service delivery.";
      case "averageValuePerItem":
        return aboveAverage ?
          "Higher value per item suggests an optimal service mix. Monitor to maintain this advantage while ensuring cost-effectiveness." :
          "Consider reviewing your prescription mix and additional services to optimize value per item while maintaining accessibility.";
      default:
        return aboveAverage ?
          "Your performance in this metric is above average, indicating strong operational efficiency." :
          "There may be opportunities to optimize this metric by reviewing peer benchmarks and best practices.";
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
          <div className="p-4 rounded-lg border border-red-100 bg-red-50">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Peer Performance Analysis</h3>
                <p className="text-gray-700">
                  You're performing {currentValue > peerAverage ? 'above' : 'below'} the peer average of {peerData.length} similar pharmacies. 
                  {getMetricSpecificInsight()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Market Position</h3>
                <p className="text-gray-700">
                  Your pharmacy ranks in the top {Math.round((currentValue > peerAverage ? 40 : 60))}% for this metric among peers in your region, 
                  indicating {currentValue > peerAverage ? 'strong' : 'competitive'} market performance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-amber-100 bg-amber-50">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Growth Opportunities</h3>
                <p className="text-gray-700">
                  Based on peer performance data, there's potential to {currentValue > peerAverage ? 
                    'maintain your leadership position by focusing on service quality and patient retention' : 
                    'improve performance by analyzing successful peer strategies and implementing targeted improvements'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeerComparisonInsights;

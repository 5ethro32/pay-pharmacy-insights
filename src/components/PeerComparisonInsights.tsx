
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
          "Your higher net payment suggests excellent service delivery and optimal reimbursement rates. Consider sharing best practices with peer pharmacies." :
          "Your net payment is below average, indicating potential opportunities to optimise your service mix and reimbursement rates. Analysing successful peer strategies could help identify areas for improvement.";
      case "totalItems":
        return aboveAverage ?
          "Your prescription volume surpasses peers, demonstrating strong patient retention. Focus on maintaining service quality whilst managing workload effectively." :
          "Lower prescription volume presents opportunities to expand your patient base. Consider reviewing successful peer strategies for patient engagement and service delivery.";
      case "pharmacyFirst":
        return aboveAverage ?
          "Outstanding performance in Pharmacy First services showcases your commitment to enhanced patient care. Your implementation strategies could benefit peer pharmacies." :
          "There appears to be untapped potential in Pharmacy First services. Consider reviewing successful peer strategies and enhancing service promotion.";
      case "averageValuePerItem":
        return aboveAverage ?
          "Your higher value per item indicates an optimal service mix. Continue monitoring to maintain this advantage whilst ensuring cost-effectiveness for patients." :
          "There may be opportunities to enhance your prescription mix and additional services to optimise value per item whilst maintaining accessibility.";
      default:
        return aboveAverage ?
          "Your performance in this metric exceeds peer averages, demonstrating strong operational efficiency." :
          "Consider reviewing peer strategies to identify potential areas for optimisation in this metric.";
    }
  };

  const isPerformingBetter = currentValue > peerAverage;

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
          <div className={`p-4 rounded-lg border ${isPerformingBetter ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
            <div className="flex items-start space-x-4">
              <div className={`${isPerformingBetter ? 'bg-emerald-100' : 'bg-red-100'} p-2 rounded-full`}>
                <TrendingUp className={`h-5 w-5 ${isPerformingBetter ? 'text-emerald-700' : 'text-red-700'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Performance Analysis</h3>
                <p className="text-gray-700">
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
                <h3 className="font-semibold text-gray-900 mb-1">Peer Context</h3>
                <p className="text-gray-700">
                  Based on data from {peerData.length} similar pharmacies, you are performing 
                  {Math.abs(((currentValue - peerAverage) / peerAverage) * 100).toFixed(1)}% 
                  {currentValue > peerAverage ? ' above ' : ' below '} 
                  the peer average.
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
                <h3 className="font-semibold text-gray-900 mb-1">Recommended Actions</h3>
                <p className="text-gray-700">
                  {currentValue > peerAverage ? 
                    'Maintain your strong performance by continuing to monitor key metrics and share successful strategies with the pharmacy network.' : 
                    'Focus on implementing targeted improvements based on peer benchmarks and consider consulting with high-performing pharmacies in your area.'}
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


import { AlertCircle, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { PaymentData } from "@/types/paymentTypes";

interface PaymentChangeExplanationProps {
  currentMonth: PaymentData | null;
  previousMonth: PaymentData | null;
  explanation: any;
}

const PaymentChangeExplanation = ({ 
  currentMonth, 
  previousMonth,
  explanation 
}: PaymentChangeExplanationProps) => {
  
  if (!currentMonth || !previousMonth || !explanation) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p>Insufficient data to analyze payment variance</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">
          {explanation.percentChange < 0 
            ? `Payment decreased by ${Math.abs(explanation.percentChange).toFixed(1)}%` 
            : `Payment increased by ${explanation.percentChange.toFixed(1)}%`
          }
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          The net payment changed from {formatCurrency(explanation.previousAmount)} 
          to {formatCurrency(explanation.currentAmount)} 
          ({formatCurrency(Math.abs(explanation.totalDifference))}).
        </p>
        {explanation.primaryFactor && (
          <div className="text-sm">
            <p className="font-medium">Primary factor:</p>
            <div className="ml-2 mt-1">
              <span className="font-medium">{explanation.primaryFactor.name}:</span>{" "}
              {explanation.primaryFactor.difference < 0 ? "Decreased" : "Increased"} by {formatCurrency(Math.abs(explanation.primaryFactor.difference))}
              <span className="text-gray-500 text-xs ml-2">
                (accounts for {Math.abs(explanation.primaryFactor.contribution).toFixed(1)}% of total change)
              </span>
            </div>
          </div>
        )}
      </div>

      {explanation.regionalPaymentDetails && explanation.regionalPaymentDetails.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Regional Payment Changes:</h3>
          <div className="space-y-2">
            {explanation.regionalPaymentDetails.slice(0, 3).map((item: any, index: number) => (
              <div 
                key={index} 
                className={`p-3 rounded-md ${
                  item.difference < 0 ? "bg-rose-50" : "bg-emerald-50"
                }`}
              >
                <div className="flex items-start">
                  {item.difference < 0 ? (
                    <ArrowDownIcon className="w-5 h-5 text-rose-600 mr-2 mt-0.5" />
                  ) : (
                    <ArrowUpIcon className="w-5 h-5 text-emerald-600 mr-2 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {item.description}
                    </p>
                    <div className="text-sm">
                      {item.previous === 0 ? (
                        <span>New payment of {formatCurrency(item.current)}</span>
                      ) : item.current === 0 ? (
                        <span>Removed payment of {formatCurrency(item.previous)}</span>
                      ) : (
                        <span>
                          Changed from {formatCurrency(item.previous)} to {formatCurrency(item.current)}
                          ({formatCurrency(Math.abs(item.difference))})
                        </span>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Contribution: {Math.abs(item.contribution).toFixed(1)}% of total change
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {explanation.components && explanation.components.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Payment Component Analysis:</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Component</th>
                  <th className="px-3 py-2 text-right">Previous</th>
                  <th className="px-3 py-2 text-right">Current</th>
                  <th className="px-3 py-2 text-right">Change</th>
                  <th className="px-3 py-2 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {explanation.components.map((comp: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2 font-medium">{comp.name}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(comp.previous)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(comp.current)}</td>
                    <td className={`px-3 py-2 text-right ${
                      comp.difference < 0 ? "text-rose-600" : "text-emerald-600"
                    }`}>
                      {formatCurrency(comp.difference)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Math.abs(comp.contribution).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 italic">
        Note: One-time payments are highlighted as they may cause significant fluctuations.
      </div>
    </div>
  );
};

export default PaymentChangeExplanation;

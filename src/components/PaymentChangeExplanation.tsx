
import React from 'react';
import { formatCurrency } from '@/utils/documentUtils';
import { ArrowDownRight, ArrowUpRight, AlertCircle, Info } from 'lucide-react';

interface PaymentChangeExplanationProps {
  currentMonth: any;
  previousMonth: any;
  explanation: any;
}

const PaymentChangeExplanation = ({ 
  currentMonth, 
  previousMonth,
  explanation 
}: PaymentChangeExplanationProps) => {
  if (!explanation || !currentMonth || !previousMonth) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">
        Payment Change Analysis
      </h2>
      
      <div className="text-sm mb-4">
        <p className={explanation.percentChange < 0 ? "text-rose-600" : "text-emerald-600"}>
          <span className="font-medium flex items-center">
            {explanation.percentChange < 0 ? (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            )}
            {explanation.percentChange < 0 ? "Decrease" : "Increase"} of {Math.abs(explanation.percentChange).toFixed(1)}%
          </span> 
          <span className="text-gray-600">
            compared to previous month
            ({formatCurrency(Math.abs(explanation.totalDifference))})
          </span>
        </p>
      </div>
      
      {explanation.primaryFactor && (
        <div className="mb-3 bg-gray-50 p-3 rounded-md border border-gray-100">
          <p className="font-medium text-gray-700 mb-1">Primary factor:</p>
          <p className={explanation.primaryFactor.difference < 0 ? "text-rose-600" : "text-emerald-600"}>
            {explanation.primaryFactor.name}: 
            {explanation.primaryFactor.difference < 0 ? " Decreased by " : " Increased by "}
            {formatCurrency(Math.abs(explanation.primaryFactor.difference))}
            <span className="text-gray-500 text-xs ml-1">
              ({Math.abs(explanation.primaryFactor.contribution).toFixed(1)}% contribution)
            </span>
          </p>
        </div>
      )}
      
      {explanation.regionalPaymentDetails && explanation.regionalPaymentDetails.length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-gray-700 mb-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
            Key changes in Regional Payments:
          </p>
          <ul className="text-sm space-y-2">
            {explanation.regionalPaymentDetails.slice(0, 3).map((item: any, index: number) => (
              <li key={index} className="pl-3 border-l-2 border-gray-200">
                <span className="font-medium">{item.description}:</span>{" "}
                <span className={item.difference < 0 ? "text-rose-600" : "text-emerald-600"}>
                  {item.previous === 0 ? "Added " : item.current === 0 ? "Removed " : 
                    item.difference < 0 ? "Decreased by " : "Increased by "}
                  {formatCurrency(Math.abs(item.difference))}
                </span>
                <span className="text-gray-500 text-xs ml-1">
                  ({Math.abs(item.contribution).toFixed(1)}% of total change)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {explanation.components && explanation.components.length > 1 && (
        <div className="mt-4">
          <p className="font-medium text-gray-700 mb-1 flex items-center">
            <Info className="h-4 w-4 mr-1 text-blue-500" />
            All payment components:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border border-gray-200">Component</th>
                  <th className="text-right p-2 border border-gray-200">Previous</th>
                  <th className="text-right p-2 border border-gray-200">Current</th>
                  <th className="text-right p-2 border border-gray-200">Change</th>
                  <th className="text-right p-2 border border-gray-200">Impact %</th>
                </tr>
              </thead>
              <tbody>
                {explanation.components.map((comp: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-200">{comp.name}</td>
                    <td className="text-right p-2 border border-gray-200">{formatCurrency(comp.previous)}</td>
                    <td className="text-right p-2 border border-gray-200">{formatCurrency(comp.current)}</td>
                    <td className={`text-right p-2 border border-gray-200 ${comp.difference < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {comp.difference < 0 ? '−' : '+'}{formatCurrency(Math.abs(comp.difference))}
                    </td>
                    <td className={`text-right p-2 border border-gray-200 font-medium ${comp.contribution < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {Math.abs(comp.contribution).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentChangeExplanation;

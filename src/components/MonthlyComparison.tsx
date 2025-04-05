
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import { PaymentData } from "./DashboardTabs";

interface MonthlyComparisonProps {
  userId: string;
  currentDocument: PaymentData | null;
  comparisonDocument: PaymentData | null;
  documentList: PaymentData[];
  selectedMonth: string | null;
  comparisonMonth: string | null;
  onSelectMonth: (monthKey: string) => void;
  onSelectComparison: (monthKey: string) => void;
}

const MonthlyComparison = ({ 
  userId, 
  currentDocument,
  comparisonDocument,
  documentList,
  selectedMonth,
  comparisonMonth,
  onSelectMonth,
  onSelectComparison
}: MonthlyComparisonProps) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
                <h3 className="mt-2 text-lg font-medium">No document found</h3>
                <p className="mt-1 text-sm text-gray-500">Please select a document for comparison.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create dropdown options for month selection
  const documentOptions = documentList.map(doc => ({
    key: `${doc.month} ${doc.year}`,
    label: `${doc.month} ${doc.year}`
  }));

  // Helper functions to handle data in both formats
  const getItemCounts = (doc: PaymentData) => {
    return doc.itemCounts || (doc.extracted_data && doc.extracted_data.itemCounts);
  };

  const getFinancials = (doc: PaymentData) => {
    return doc.financials || (doc.extracted_data && doc.extracted_data.financials);
  };

  const getRegionalPayments = (doc: PaymentData) => {
    return doc.regionalPayments || (doc.extracted_data && doc.extracted_data.regionalPayments);
  };

  return (
    <div className="space-y-6">
      {/* Month Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={selectedMonth || ''} 
              onChange={(e) => onSelectMonth(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {documentOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Comparison Month</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={comparisonMonth || ''} 
              onChange={(e) => onSelectComparison(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {documentOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <PaymentVarianceAnalysis 
          currentData={currentDocument} 
          previousData={comparisonDocument} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getRegionalPayments(currentDocument) && (
          <RegionalPaymentsChart 
            regionalPayments={getRegionalPayments(currentDocument)} 
          />
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Prescriptions Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getItemCounts(currentDocument) && getItemCounts(comparisonDocument) ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Total Items</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {getItemCounts(comparisonDocument)?.total || 0}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium">
                        {getItemCounts(currentDocument)?.total || 0}
                      </span>
                      {(getItemCounts(currentDocument)?.total || 0) > (getItemCounts(comparisonDocument)?.total || 0) ? (
                        <span className="text-xs text-emerald-600">
                          +{(((getItemCounts(currentDocument)?.total || 0) - (getItemCounts(comparisonDocument)?.total || 0)) / 
                          (getItemCounts(comparisonDocument)?.total || 1) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-rose-600">
                          {(((getItemCounts(currentDocument)?.total || 0) - (getItemCounts(comparisonDocument)?.total || 0)) / 
                          (getItemCounts(comparisonDocument)?.total || 1) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">AMS Items</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {getItemCounts(comparisonDocument)?.ams || 0}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium">
                        {getItemCounts(currentDocument)?.ams || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average Item Value</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        £{((getFinancials(comparisonDocument)?.grossIngredientCost || 0) / 
                          (getItemCounts(comparisonDocument)?.total || 1)).toFixed(2)}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium">
                        £{((getFinancials(currentDocument)?.grossIngredientCost || 0) / 
                          (getItemCounts(currentDocument)?.total || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Comparison data not available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>One-Time Payment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {(getRegionalPayments(currentDocument) || getRegionalPayments(comparisonDocument)) ? (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  This analysis identifies one-time payments that may affect month-to-month comparisons.
                </p>
                
                <div className="space-y-4">
                  {/* Payments present in previous month but not in current month */}
                  {getRegionalPayments(comparisonDocument)?.paymentDetails?.some((prev: any) => {
                    const found = getRegionalPayments(currentDocument)?.paymentDetails?.find(
                      (curr: any) => curr.description === prev.description
                    );
                    return !found && prev.amount > 500;
                  }) && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-700 mb-2">
                        One-time payments from previous month (not present this month):
                      </h4>
                      <ul className="space-y-2">
                        {getRegionalPayments(comparisonDocument)?.paymentDetails
                          .filter((prev: any) => {
                            const found = getRegionalPayments(currentDocument)?.paymentDetails?.find(
                              (curr: any) => curr.description === prev.description
                            );
                            return !found && prev.amount > 500;
                          })
                          .sort((a: any, b: any) => b.amount - a.amount)
                          .map((payment: any, idx: number) => (
                            <li key={idx} className="bg-amber-50 p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{payment.description}</span>
                                <span className="font-medium">
                                  £{payment.amount.toLocaleString('en-UK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                              </div>
                              <p className="text-xs text-amber-700 mt-1">
                                This payment was present in the previous month but not in the current month.
                              </p>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  )}
                  
                  {/* Payments present in current month but not in previous month */}
                  {getRegionalPayments(currentDocument)?.paymentDetails?.some((curr: any) => {
                    const found = getRegionalPayments(comparisonDocument)?.paymentDetails?.find(
                      (prev: any) => prev.description === curr.description
                    );
                    return !found && curr.amount > 500;
                  }) && (
                    <div>
                      <h4 className="text-sm font-medium text-emerald-700 mb-2">
                        New payments in current month:
                      </h4>
                      <ul className="space-y-2">
                        {getRegionalPayments(currentDocument)?.paymentDetails
                          .filter((curr: any) => {
                            const found = getRegionalPayments(comparisonDocument)?.paymentDetails?.find(
                              (prev: any) => prev.description === curr.description
                            );
                            return !found && curr.amount > 500;
                          })
                          .sort((a: any, b: any) => b.amount - a.amount)
                          .map((payment: any, idx: number) => (
                            <li key={idx} className="bg-emerald-50 p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="font-medium">{payment.description}</span>
                                <span className="font-medium">
                                  £{payment.amount.toLocaleString('en-UK', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                              </div>
                              <p className="text-xs text-emerald-700 mt-1">
                                This is a new payment in the current month.
                              </p>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  )}
                  
                  {(!getRegionalPayments(comparisonDocument) && 
                    !getRegionalPayments(currentDocument)?.paymentDetails?.some((curr: any) => {
                      const found = getRegionalPayments(comparisonDocument)?.paymentDetails?.find(
                        (prev: any) => prev.description === curr.description
                      );
                      return !found && curr.amount > 500;
                    })) && 
                    !getRegionalPayments(comparisonDocument)?.paymentDetails?.some((prev: any) => {
                      const found = getRegionalPayments(currentDocument)?.paymentDetails?.find(
                        (curr: any) => curr.description === prev.description
                      );
                      return !found && prev.amount > 500;
                    }) && (
                    <div className="text-center text-gray-500 py-6">
                      <p>No significant one-time payments detected</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                <p>Regional payment data not available for one-time payment analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyComparison;

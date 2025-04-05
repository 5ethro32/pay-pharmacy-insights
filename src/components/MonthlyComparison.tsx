
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";

const MonthlyComparison = ({ userId }: { userId: string }) => {
  const { id: documentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [previousMonthDocument, setPreviousMonthDocument] = useState<any>(null);

  useEffect(() => {
    const fetchDocumentForComparison = async () => {
      if (!documentId || !userId) return;
      
      try {
        setLoading(true);
        
        // Fetch the current document
        const { data: currentDoc, error: currentError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .eq('user_id', userId)
          .single();
        
        if (currentError) throw currentError;
        if (!currentDoc) return;
        
        setCurrentDocument(currentDoc);
        
        // Fetch previous month's document
        if (currentDoc.month && currentDoc.year) {
          let prevMonth = currentDoc.month;
          let prevYear = currentDoc.year;
          
          // Calculate previous month (handle January case)
          const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                             "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
          
          const currentMonthIndex = monthNames.findIndex(
            m => m.toLowerCase() === currentDoc.month.toLowerCase()
          );
          
          if (currentMonthIndex === 0) { // January
            prevMonth = "DECEMBER";
            prevYear = prevYear - 1;
          } else if (currentMonthIndex > 0) {
            prevMonth = monthNames[currentMonthIndex - 1];
          }
          
          const { data: prevDocs, error: prevError } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .eq('month', prevMonth)
            .eq('year', prevYear)
            .order('uploaded_at', { ascending: false })
            .limit(1);
          
          if (prevError) throw prevError;
          
          if (prevDocs && prevDocs.length > 0) {
            setPreviousMonthDocument(prevDocs[0]);
          } else {
            setPreviousMonthDocument(null);
          }
        }
      } catch (error: any) {
        console.error("Error fetching document comparison:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch document comparison",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentForComparison();
  }, [documentId, userId]);

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
                <p className="mt-1 text-sm text-gray-500">The requested document could not be found.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <PaymentVarianceAnalysis 
          currentData={currentDocument} 
          previousData={previousMonthDocument} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegionalPaymentsChart 
          regionalPayments={currentDocument.extracted_data?.regionalPayments} 
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Prescriptions Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentDocument.extracted_data?.itemCounts && previousMonthDocument?.extracted_data?.itemCounts ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Total Items</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {previousMonthDocument.extracted_data.itemCounts.total || 0}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium">
                        {currentDocument.extracted_data.itemCounts.total || 0}
                      </span>
                      {currentDocument.extracted_data.itemCounts.total > previousMonthDocument.extracted_data.itemCounts.total ? (
                        <span className="text-xs text-emerald-600">
                          +{((currentDocument.extracted_data.itemCounts.total - previousMonthDocument.extracted_data.itemCounts.total) / 
                          previousMonthDocument.extracted_data.itemCounts.total * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-rose-600">
                          {((currentDocument.extracted_data.itemCounts.total - previousMonthDocument.extracted_data.itemCounts.total) / 
                          previousMonthDocument.extracted_data.itemCounts.total * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">AMS Items</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {previousMonthDocument.extracted_data.itemCounts.ams || 0}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium">
                        {currentDocument.extracted_data.itemCounts.ams || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average Item Value</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        £{(previousMonthDocument.extracted_data.financials?.grossIngredientCost / 
                          previousMonthDocument.extracted_data.itemCounts.total || 0).toFixed(2)}
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium">
                        £{(currentDocument.extracted_data.financials?.grossIngredientCost / 
                          currentDocument.extracted_data.itemCounts.total || 0).toFixed(2)}
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
            {currentDocument.extracted_data?.regionalPayments || previousMonthDocument?.extracted_data?.regionalPayments ? (
              <div>
                <p className="mb-4 text-sm text-gray-600">
                  This analysis identifies one-time payments that may affect month-to-month comparisons.
                </p>
                
                <div className="space-y-4">
                  {/* Payments present in previous month but not in current month */}
                  {previousMonthDocument?.extracted_data?.regionalPayments?.paymentDetails?.some((prev: any) => {
                    const found = currentDocument.extracted_data?.regionalPayments?.paymentDetails?.find(
                      (curr: any) => curr.description === prev.description
                    );
                    return !found && prev.amount > 500;
                  }) && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-700 mb-2">
                        One-time payments from previous month (not present this month):
                      </h4>
                      <ul className="space-y-2">
                        {previousMonthDocument.extracted_data.regionalPayments.paymentDetails
                          .filter((prev: any) => {
                            const found = currentDocument.extracted_data?.regionalPayments?.paymentDetails?.find(
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
                  {currentDocument.extracted_data?.regionalPayments?.paymentDetails?.some((curr: any) => {
                    const found = previousMonthDocument?.extracted_data?.regionalPayments?.paymentDetails?.find(
                      (prev: any) => prev.description === curr.description
                    );
                    return !found && curr.amount > 500;
                  }) && (
                    <div>
                      <h4 className="text-sm font-medium text-emerald-700 mb-2">
                        New payments in current month:
                      </h4>
                      <ul className="space-y-2">
                        {currentDocument.extracted_data.regionalPayments.paymentDetails
                          .filter((curr: any) => {
                            const found = previousMonthDocument?.extracted_data?.regionalPayments?.paymentDetails?.find(
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
                  
                  {(!previousMonthDocument?.extracted_data?.regionalPayments && 
                    !currentDocument.extracted_data?.regionalPayments?.paymentDetails?.some((curr: any) => {
                      const found = previousMonthDocument?.extracted_data?.regionalPayments?.paymentDetails?.find(
                        (prev: any) => prev.description === curr.description
                      );
                      return !found && curr.amount > 500;
                    })) && 
                    !previousMonthDocument?.extracted_data?.regionalPayments?.paymentDetails?.some((prev: any) => {
                      const found = currentDocument.extracted_data?.regionalPayments?.paymentDetails?.find(
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

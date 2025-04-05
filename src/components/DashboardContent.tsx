
import { useState, useEffect } from "react";
import { PaymentData } from "@/types/paymentTypes";
import MonthlyComparison from "./MonthlyComparison";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import AIInsightsPanel from "./AIInsightsPanel";
import LineChartMetrics from "./LineChartMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardContentProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const DashboardContent = ({ userId, documents, loading }: DashboardContentProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(null);
  
  useEffect(() => {
    if (documents.length > 0 && !selectedMonth) {
      setSelectedMonth(`${documents[0].month} ${documents[0].year}`);
      
      if (documents.length > 1) {
        setComparisonMonth(`${documents[1].month} ${documents[1].year}`);
      }
    }
  }, [documents, selectedMonth]);
  
  console.log("Dashboard Content - Documents:", documents);
  console.log("Dashboard Content - Selected Month:", selectedMonth);
  console.log("Dashboard Content - Comparison Month:", comparisonMonth);
  
  const getSelectedData = () => {
    if (!selectedMonth) return null;
    
    const [month, yearStr] = selectedMonth.split(' ');
    const year = parseInt(yearStr);
    
    return documents.find(doc => doc.month === month && doc.year === year);
  };
  
  const getComparisonData = () => {
    if (!comparisonMonth) return null;
    
    const [month, yearStr] = comparisonMonth.split(' ');
    const year = parseInt(yearStr);
    
    return documents.find(doc => doc.month === month && doc.year === year);
  };
  
  const handleMonthSelect = (monthKey: string) => {
    if (monthKey === selectedMonth) return;
    
    if (monthKey === comparisonMonth) {
      setComparisonMonth(selectedMonth);
    }
    
    setSelectedMonth(monthKey);
  };
  
  const handleComparisonSelect = (monthKey: string) => {
    if (monthKey === comparisonMonth) return;
    
    if (monthKey === selectedMonth) {
      setSelectedMonth(comparisonMonth);
    }
    
    setComparisonMonth(monthKey);
  };

  // Find the previous month's document (if any) for comparison indicators
  const getPreviousMonthData = () => {
    if (!selectedMonth || documents.length <= 1) return null;
    
    const currentDoc = getSelectedData();
    if (!currentDoc) return null;
    
    // Sort documents by date (descending) to find the previous one
    const sortedDocs = [...documents].sort((a, b) => {
      const yearDiff = b.year - a.year;
      if (yearDiff !== 0) return yearDiff;
      
      const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ];
      return months.indexOf(b.month) - months.indexOf(a.month);
    });
    
    // Find the current document index
    const currentIndex = sortedDocs.findIndex(
      doc => doc.month === currentDoc.month && doc.year === currentDoc.year
    );
    
    // If found and not the last document, return the previous one
    if (currentIndex !== -1 && currentIndex < sortedDocs.length - 1) {
      return sortedDocs[currentIndex + 1];
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (documents.length < 1) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Payment Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No payment schedules available</h3>
            <p className="text-gray-500 mb-6">Please upload some documents in the Upload tab.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get potential previous month data for automatic comparison
  const previousMonthData = getPreviousMonthData();

  return (
    <div className="space-y-6">
      {/* Document selector - allows selecting primary document */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Payment Schedule</span>
            <div className="text-sm font-normal">
              <select 
                className="ml-2 px-2 py-1 bg-white border rounded text-sm"
                value={selectedMonth || ''}
                onChange={(e) => handleMonthSelect(e.target.value)}
              >
                {documents.map((doc) => (
                  <option key={`${doc.month}-${doc.year}`} value={`${doc.month} ${doc.year}`}>
                    {doc.month} {doc.year}
                  </option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      
      {/* Always render LineChartMetrics if there are two or more documents */}
      {documents.length >= 1 && (
        <div className="mb-8">
          <LineChartMetrics documents={documents} />
        </div>
      )}
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="current">Current Period</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <div className="mt-4">
            <AIInsightsPanel 
              currentDocument={getSelectedData()}
              previousDocument={previousMonthData}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {getSelectedData()?.regionalPayments && (
              <RegionalPaymentsChart regionalPayments={getSelectedData()?.regionalPayments} />
            )}
            
            <PaymentVarianceAnalysis 
              currentData={getSelectedData()} 
              previousData={previousMonthData} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <MonthlyComparison 
            userId={userId}
            currentDocument={getSelectedData()}
            comparisonDocument={getComparisonData()}
            documentList={documents}
            onSelectMonth={handleMonthSelect}
            onSelectComparison={handleComparisonSelect}
            selectedMonth={selectedMonth || ''}
            comparisonMonth={comparisonMonth || ''}
          />
          
          <PaymentVarianceAnalysis 
            currentData={getSelectedData()} 
            previousData={getComparisonData()} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;

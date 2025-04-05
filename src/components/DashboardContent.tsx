
import { useState, useEffect } from "react";
import { PaymentData } from "@/types/paymentTypes";
import MonthlyComparison from "./MonthlyComparison";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import AIInsightsPanel from "./AIInsightsPanel";
import LineChartMetrics from "./LineChartMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KeyMetricsSummary from "./KeyMetricsSummary";

interface DashboardContentProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

// Helper function to get month index for sorting
const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
};

// Helper function to sort months chronologically (newest first)
const sortDocumentsChronologically = (docs: PaymentData[]) => {
  return [...docs].sort((a, b) => {
    // First compare by year (descending)
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    
    // If same year, compare by month index (descending)
    return getMonthIndex(b.month) - getMonthIndex(a.month);
  });
};

const DashboardContent = ({ userId, documents, loading }: DashboardContentProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(null);
  
  useEffect(() => {
    if (documents.length > 0 && !selectedMonth) {
      // Sort documents chronologically (newest first)
      const sortedDocs = sortDocumentsChronologically(documents);
      
      // Set the most recent document as selected
      setSelectedMonth(`${sortedDocs[0].month} ${sortedDocs[0].year}`);
      
      if (sortedDocs.length > 1) {
        setComparisonMonth(`${sortedDocs[1].month} ${sortedDocs[1].year}`);
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

  // Get the chronologically previous month data relative to selected month
  const getPreviousMonthData = () => {
    if (!selectedMonth || documents.length <= 1) return null;
    
    const currentDoc = getSelectedData();
    if (!currentDoc) return null;
    
    // Sort documents chronologically (newest first)
    const sortedDocs = sortDocumentsChronologically(documents);
    
    // Find the current document's index in the sorted array
    const currentIndex = sortedDocs.findIndex(
      doc => doc.month === currentDoc.month && doc.year === currentDoc.year
    );
    
    // Get the next document in the array (which is chronologically before the current one)
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

  // Sort documents chronologically for display
  const sortedDocuments = sortDocumentsChronologically(documents);
  const previousMonthData = getPreviousMonthData();
  const currentData = getSelectedData();
  const comparisonData = getComparisonData();

  console.log("Current document:", currentData);
  console.log("Previous month document:", previousMonthData);
  console.log("Comparison document:", comparisonData);

  return (
    <div className="space-y-6">
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
                {sortedDocuments.map((doc) => (
                  <option key={`${doc.month}-${doc.year}`} value={`${doc.month} ${doc.year}`}>
                    {doc.month} {doc.year}
                  </option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>
      
      {currentData && (
        <KeyMetricsSummary 
          currentData={currentData} 
          previousData={previousMonthData} 
        />
      )}
      
      {documents.length >= 1 && (
        <div className="mb-8">
          <LineChartMetrics documents={sortedDocuments} />
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
              currentDocument={currentData}
              previousDocument={previousMonthData}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {currentData?.regionalPayments && (
              <RegionalPaymentsChart regionalPayments={currentData.regionalPayments} />
            )}
            
            <PaymentVarianceAnalysis 
              currentData={currentData} 
              previousData={previousMonthData} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <MonthlyComparison 
            userId={userId}
            currentDocument={currentData}
            comparisonDocument={comparisonData}
            documentList={sortedDocuments}
            onSelectMonth={handleMonthSelect}
            onSelectComparison={handleComparisonSelect}
            selectedMonth={selectedMonth || ''}
            comparisonMonth={comparisonMonth || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;

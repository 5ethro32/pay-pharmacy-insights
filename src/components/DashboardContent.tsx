
import { useState, useEffect } from "react";
import { PaymentData } from "@/types/paymentTypes";
import MonthlyComparison from "./MonthlyComparison";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import AIInsightsPanel from "./AIInsightsPanel";
import LineChartMetrics from "./LineChartMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle, AlertTriangle, Users, User, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KeyMetricsSummary from "./KeyMetricsSummary";
import ItemsBreakdown from "./ItemsBreakdown";
import FinancialBreakdown from "./FinancialBreakdown";
import PaymentScheduleDetails from "./PaymentScheduleDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardContentProps {
  userId: string;
  documents: PaymentData[];
  loading: boolean;
}

const getMonthIndex = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
};

const sortDocumentsChronologically = (docs: PaymentData[]) => {
  return [...docs].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    
    return getMonthIndex(b.month) - getMonthIndex(a.month);
  });
};

const formatMonth = (month: string): string => {
  if (!month) return '';
  return month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
};

const getAbbreviatedMonth = (month: string): string => {
  if (!month) return '';
  return month.substring(0, 3);
};

const getPaymentDate = (month: string, year: number): string => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthIndex = months.indexOf(month);
  
  const paymentMonthIndex = (monthIndex + 2) % 12;
  
  const paymentYear = (monthIndex > 9) ? year + 1 : year;
  
  return `${months[paymentMonthIndex]} 30, ${paymentYear}`;
};

const DashboardContent = ({ userId, documents, loading }: DashboardContentProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(null);
  const [comparisonTab, setComparisonTab] = useState<string>("monthly");
  
  useEffect(() => {
    if (documents.length > 0 && !selectedMonth) {
      const sortedDocs = sortDocumentsChronologically(documents);
      
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

  const getPreviousMonthData = () => {
    if (!selectedMonth || documents.length <= 1) return null;
    
    const currentDoc = getSelectedData();
    if (!currentDoc) return null;
    
    const sortedDocs = sortDocumentsChronologically(documents);
    
    const currentIndex = sortedDocs.findIndex(
      doc => doc.month === currentDoc.month && doc.year === currentDoc.year
    );
    
    if (currentIndex !== -1 && currentIndex < sortedDocs.length - 1) {
      return sortedDocs[currentIndex + 1];
    }
    
    return null;
  };

  const checkUploadStatus = () => {
    if (documents.length === 0) return { upToDate: false, message: "No uploads" };
    
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();
    
    const sortedDocs = sortDocumentsChronologically(documents);
    
    // Check if the expected document exists in the uploads
    if (sortedDocs.length > 0) {
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const isPaymentDeadlinePassed = today.getDate() >= lastDayOfMonth;
      
      const expectedMonthOffset = isPaymentDeadlinePassed ? 2 : 3;
      let expectedMonthIndex = (currentMonthIndex - expectedMonthOffset) % 12;
      if (expectedMonthIndex < 0) expectedMonthIndex += 12;
      
      const expectedYear = (currentMonthIndex < expectedMonthOffset) ? currentYear - 1 : currentYear;
      const expectedMonth = months[expectedMonthIndex];
      
      // Important fix: Check properly against both formatted and raw month names
      const expectedDocExists = sortedDocs.some(doc => 
        (doc.month.toUpperCase() === expectedMonth.toUpperCase() || 
         formatMonth(doc.month).toUpperCase() === expectedMonth.toUpperCase()) && 
        doc.year === expectedYear
      );
      
      if (expectedDocExists) {
        return { upToDate: true, message: "Up to date" };
      } else {
        return { 
          upToDate: false, 
          message: `Missing ${expectedMonth.substring(0, 3)} ${expectedYear}` 
        };
      }
    }
    
    return { upToDate: false, message: "No recent uploads" };
  };

  const getNextDispensingPeriod = () => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();
    
    let nextDispensingMonthIndex = (currentMonthIndex - 2) % 12;
    if (nextDispensingMonthIndex < 0) nextDispensingMonthIndex += 12;
    
    const nextDispensingYear = (currentMonthIndex < 2) ? currentYear - 1 : currentYear;
    
    return { 
      month: months[nextDispensingMonthIndex], 
      year: nextDispensingYear 
    };
  };

  const handlePremiumFeatureClick = () => {
    // This would be replaced with actual upgrade logic in the future
    console.log("Premium feature clicked");
  };

  const uploadStatus = checkUploadStatus();
  const nextDispensingPeriod = getNextDispensingPeriod();
  const nextPaymentDate = getPaymentDate(nextDispensingPeriod.month, nextDispensingPeriod.year);

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

  const sortedDocuments = sortDocumentsChronologically(documents);
  const previousMonthData = getPreviousMonthData();
  const currentData = getSelectedData();
  const comparisonData = getComparisonData();

  console.log("Current document:", currentData);
  console.log("Previous month document:", previousMonthData);
  console.log("Comparison document:", comparisonData);

  const renderPremiumFeatureOverlay = () => (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-md">
        <Lock className="h-12 w-12 text-red-800 mb-4" />
        <h3 className="text-xl font-bold text-red-800 mb-2">Premium Feature</h3>
        <p className="text-gray-700 mb-6 max-w-md text-center">
          Upgrade to Premium to access advanced comparison features
        </p>
        <div className="flex gap-4">
          <button 
            onClick={handlePremiumFeatureClick}
            className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Upgrade Now
          </button>
          <button 
            onClick={() => setComparisonTab("monthly")}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {currentData && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Your Dashboard
              </h2>
              <p className="text-gray-600 mt-1">Pharmacy Payment Analytics</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Contractor Code</div>
                  <div className="font-bold text-xl">{currentData.contractorCode || "1737"}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Upload Status</div>
                  <div className="font-bold text-xl flex items-center">
                    {uploadStatus.upToDate ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-green-700">{uploadStatus.message}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-1" />
                        <span className="text-amber-700">{uploadStatus.message}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-4 bg-red-50/30 p-4 rounded-md border border-red-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-red-800" />
              <div>
                <div className="font-semibold text-gray-900">Next Dispensing Period</div>
                <div className="text-gray-600">{getAbbreviatedMonth(nextDispensingPeriod.month)} {nextDispensingPeriod.year}</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-semibold text-gray-900">Payment Date</div>
              <div className="bg-red-800 text-white px-3 py-1 rounded-md text-sm font-medium mt-1">
                {nextPaymentDate}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentData && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Payment Schedule</h3>
            <Select 
              value={selectedMonth || ''}
              onValueChange={handleMonthSelect}
            >
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {sortedDocuments.map((doc) => (
                  <SelectItem key={`${doc.month}-${doc.year}`} value={`${doc.month} ${doc.year}`}>
                    {getAbbreviatedMonth(doc.month)} {doc.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <KeyMetricsSummary 
            currentData={currentData} 
            previousData={previousMonthData} 
          />
        </div>
      )}

      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <ItemsBreakdown currentData={currentData} />
          <FinancialBreakdown currentData={currentData} />
        </div>
      )}
      
      {currentData && previousMonthData && (
        <div className="mt-4">
          <AIInsightsPanel 
            currentDocument={currentData}
            previousDocument={previousMonthData}
          />
        </div>
      )}
      
      {documents.length >= 1 && (
        <div className="mb-8">
          <LineChartMetrics documents={documents} />
        </div>
      )}
      
      {currentData && (
        <div className="w-full mb-6">
          <PaymentVarianceAnalysis 
            currentData={currentData} 
            previousData={previousMonthData} 
          />
        </div>
      )}
      
      {currentData && (
        <div className="grid grid-cols-1 gap-6 mt-8">
          <PaymentScheduleDetails currentData={currentData} />
        </div>
      )}
      
      <Tabs defaultValue="monthly" className="w-full mt-8">
        <TabsList className="mb-4 flex">
          <TabsTrigger value="monthly" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Month Comparison</span>
          </TabsTrigger>
          <TabsTrigger value="group" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Group Comparison</span>
          </TabsTrigger>
          <TabsTrigger value="peer" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Peer Comparison</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly">
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
        
        <TabsContent value="group">
          {renderPremiumFeatureOverlay()}
          <div className="min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Group Pharmacy Comparison</h3>
            <p className="text-gray-600">
              Compare performance metrics across your pharmacy group.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="peer">
          {renderPremiumFeatureOverlay()}
          <div className="min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Peer Pharmacy Comparison</h3>
            <p className="text-gray-600">
              Compare your pharmacy performance against similar pharmacies in your area.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;

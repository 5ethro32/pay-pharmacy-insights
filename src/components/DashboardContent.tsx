import { useState, useEffect } from 'react';
import { PaymentData } from "@/types/paymentTypes";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import AIInsightsPanel from "./AIInsightsPanel";
import LineChartMetrics from "./LineChartMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import KeyMetricsSummary from "./KeyMetricsSummary";
import ItemsBreakdown from "./ItemsBreakdown";
import FinancialBreakdown from "./FinancialBreakdown";
import PaymentScheduleDetails from "./PaymentScheduleDetails";
import PharmacyFirstDetails from "./PharmacyFirstDetails";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import SupplementaryPaymentsTable from "./SupplementaryPaymentsTable";
import { MetricKey } from "@/constants/chartMetrics";
import HighValueItems from "./HighValueItems";

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
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");
  const [firstName, setFirstName] = useState<string>("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (documents && documents.length > 0) {
      const pfsDataCount = documents.filter(doc => 
        doc.pfsDetails && Object.keys(doc.pfsDetails).length > 0
      ).length;
      console.log(`Data summary: ${documents.length} documents found, ${pfsDataCount} with PFS details`);
      
      const suppPaymentsCount = documents.filter(doc => 
        doc.supplementaryPayments && 
        doc.supplementaryPayments.details && 
        doc.supplementaryPayments.details.length > 0
      ).length;
      
      console.log(`Documents with supplementary payments: ${suppPaymentsCount}`);
      
      documents.forEach(doc => {
        const hasPfsDetails = doc.pfsDetails && Object.keys(doc.pfsDetails).length > 0;
        const pfsDetailsHasData = doc.pfsDetails && Object.values(doc.pfsDetails).some(v => v !== null);
        const hasSupplementaryPayments = doc.supplementaryPayments && 
                                        doc.supplementaryPayments.details && 
                                        doc.supplementaryPayments.details.length > 0;
        
        console.log(`Document ${doc.month} ${doc.year}:` + 
          `\n  - Has PFS details object: ${hasPfsDetails ? 'Yes' : 'No'}` +
          `\n  - PFS details has non-null values: ${pfsDetailsHasData ? 'Yes' : 'No'}` +
          `\n  - Has supplementary payments: ${hasSupplementaryPayments ? 'Yes' : 'No'}` +
          `\n  - Supplementary payments details: ${hasSupplementaryPayments ? 
            doc.supplementaryPayments.details.length + ' entries' : 'None'}` +
          `\n  - Pharmacy First Base Payment: ${doc.financials?.pharmacyFirstBase !== undefined ? doc.financials.pharmacyFirstBase : 'Not available'}` +
          `\n  - Pharmacy First Activity Payment: ${doc.financials?.pharmacyFirstActivity !== undefined ? doc.financials.pharmacyFirstActivity : 'Not available'}` +
          `\n  - NHS PFS Items: ${doc.itemCounts?.nhsPfs || 'Not available'}` +
          `\n  - High value items: ${doc.extracted_data?.highValueItems ? 
            doc.extracted_data.highValueItems.length + ' items' : 'None'}`
        );
      });
    }
  }, [documents]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      
      if (data && data.full_name) {
        const firstNameFromFullName = data.full_name.split(' ')[0];
        setFirstName(firstNameFromFullName);
      }
    };
    
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (documents.length > 0 && !selectedMonth) {
      const sortedDocs = sortDocumentsChronologically(documents);
      setSelectedMonth(`${sortedDocs[0].month} ${sortedDocs[0].year}`);
    }
  }, [documents, selectedMonth]);
  
  const getSelectedData = () => {
    if (!selectedMonth) return null;
    
    const [month, yearStr] = selectedMonth.split(' ');
    const year = parseInt(yearStr);
    
    const selectedDoc = documents.find(doc => doc.month === month && doc.year === year);
    if (selectedDoc) {
      console.log("Selected document data:", selectedDoc);
      console.log("PFS details in selected document:", selectedDoc.pfsDetails);
      console.log("Supplementary payments in selected document:", 
                 selectedDoc.supplementaryPayments ? 
                 selectedDoc.supplementaryPayments.details?.length + ' entries' || '0 entries' : 
                 'none');
      console.log("Document source:", selectedDoc.id ? "from documents table" : "unknown source");
      
      console.log("High value items in document:", 
                 selectedDoc.extracted_data?.highValueItems ? 
                 selectedDoc.extracted_data.highValueItems.length + ' items' : 
                 'none');
    } else {
      console.log("No document found for", month, year);
    }
    
    return selectedDoc;
  };
  
  const handleMonthSelect = (monthKey: string) => {
    if (monthKey === selectedMonth) return;
    setSelectedMonth(monthKey);
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
    
    if (sortedDocs.length > 0) {
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const isPaymentDeadlinePassed = today.getDate() >= lastDayOfMonth;
      
      const expectedMonthOffset = isPaymentDeadlinePassed ? 2 : 3;
      let expectedMonthIndex = (currentMonthIndex - expectedMonthOffset) % 12;
      if (expectedMonthIndex < 0) expectedMonthIndex += 12;
      
      const expectedYear = (currentMonthIndex < expectedMonthOffset) ? currentYear - 1 : currentYear;
      const expectedMonth = months[expectedMonthIndex];
      
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
      <Card className="my-6 w-full overflow-hidden">
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

  const renderSupplementaryPaymentsTable = (currentData: PaymentData) => {
    console.log("Rendering supplementary payments table with data:", currentData.supplementaryPayments);
    
    if (!currentData.supplementaryPayments) {
      console.log("No supplementary payments data available for rendering");
      return (
        <Card>
          <CardHeader>
            <CardTitle>Supplementary & Service Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplementaryPaymentsTable payments={undefined} />
          </CardContent>
        </Card>
      );
    }
    
    console.log("Supplementary payments details count:", 
               currentData.supplementaryPayments.details?.length || 0);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplementary & Service Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplementaryPaymentsTable payments={currentData.supplementaryPayments} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {currentData && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:gap-4 w-full">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {firstName ? `Hi, ${firstName}` : "Dashboard"}
              </h2>
              <p className="text-gray-600 mt-1">Welcome to your pharmacy payment dashboard</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full sm:w-auto">
              <Card className="bg-white hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Contractor Code</div>
                  <div className="font-bold text-base sm:text-xl">{currentData.contractorCode || "1737"}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Upload Status</div>
                  <div className="font-bold text-base sm:text-xl flex items-center">
                    {uploadStatus.upToDate ? (
                      <>
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-1" />
                        <span className="text-green-700 text-sm sm:text-base">{uploadStatus.message}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-1" />
                        <span className="text-amber-700 text-sm sm:text-base">{uploadStatus.message}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-4 bg-red-50/30 p-3 sm:p-4 rounded-md border border-red-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-red-800" />
              <div>
                <div className="font-semibold text-sm sm:text-base text-gray-900">Next Dispensing Period</div>
                <div className="text-gray-600 font-bold text-sm sm:text-base">{formatMonth(nextDispensingPeriod.month)} {nextDispensingPeriod.year}</div>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
              <div className="font-semibold text-sm sm:text-base text-gray-900">Payment Date</div>
              <div className="bg-red-800 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium mt-1">
                {nextPaymentDate}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentData && (
        <div className="w-full max-w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Payment Details
              </h3>
            </div>
            <Select 
              value={selectedMonth || ''}
              onValueChange={handleMonthSelect}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-red-800 mr-2" />
                  <SelectValue placeholder="Select period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortedDocuments.map((doc) => (
                  <SelectItem 
                    key={`${doc.month}-${doc.year}`} 
                    value={`${doc.month} ${doc.year}`}
                    className="capitalize"
                  >
                    {formatMonth(doc.month)} {doc.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full max-w-full overflow-hidden">
            <KeyMetricsSummary 
              currentData={currentData} 
              previousData={previousMonthData}
              onMetricClick={setSelectedMetric}
            />
          </div>
        </div>
      )}
      
      {documents.length >= 1 && (
        <div className="mb-6 sm:mb-8 w-full max-w-full overflow-hidden">
          <LineChartMetrics 
            documents={documents} 
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
          />
        </div>
      )}
      
      {currentData && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4 w-full">
          <div className="w-full max-w-full overflow-hidden">
            <ItemsBreakdown currentData={currentData} />
          </div>
          <div className="w-full max-w-full overflow-hidden">
            <FinancialBreakdown currentData={currentData} />
          </div>
        </div>
      )}
      
      {currentData && previousMonthData && (
        <div className="mt-4 w-full max-w-full overflow-hidden">
          <AIInsightsPanel 
            currentDocument={currentData}
            previousDocument={previousMonthData}
          />
        </div>
      )}
      
      {currentData && (
        <div className="w-full mt-6">
          {renderSupplementaryPaymentsTable(currentData)}
        </div>
      )}
      
      {currentData && currentData.extracted_data?.highValueItems && currentData.extracted_data.highValueItems.length > 0 && (
        <div className="w-full mt-6">
          <HighValueItems items={currentData.extracted_data.highValueItems} />
        </div>
      )}
    </div>
  );
};

export default DashboardContent;

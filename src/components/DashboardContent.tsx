import { useState, useEffect } from 'react';
import { PaymentData } from "@/types/paymentTypes";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";
import AIInsightsPanel from "./AIInsightsPanel";
import LineChartMetrics from "./LineChartMetrics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import KeyMetricsSummary from "./KeyMetricsSummary";
import ItemsBreakdown from "./ItemsBreakdown";
import FinancialBreakdown from "./FinancialBreakdown";
import PaymentScheduleDetails from "./PaymentScheduleDetails";
import PharmacyFirstDetails from "./PharmacyFirstDetails";
import PrescriptionVolumeAnalysis from "./PrescriptionVolumeAnalysis";
import HighValueItemsAnalysis from "./HighValueItemsAnalysis";
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
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";
import { ErrorBoundary } from "react-error-boundary";

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

const formatHealthBoard = (healthBoard: string | undefined): string => {
  if (!healthBoard || healthBoard === "") {
    return "NHS";
  }
  
  // Case-insensitive check for Glasgow
  if (healthBoard.toUpperCase().includes("GLASGOW") || 
      healthBoard.toUpperCase().includes("GG&C") || 
      healthBoard.toUpperCase().includes("CLYDE") ||
      healthBoard.toUpperCase().includes("GREATER GLASGOW")) {
    return "GG&C";
  }
  
  // Case-insensitive check for Lothian
  if (healthBoard.toUpperCase().includes("LOTHIAN")) {
    return "Lothian";
  }
  
  // Case-insensitive check for Grampian
  if (healthBoard.toUpperCase().includes("GRAMPIAN")) {
    return "Grampian";
  }
  
  // Case-insensitive check for Tayside
  if (healthBoard.toUpperCase().includes("TAYSIDE")) {
    return "Tayside";
  }
  
  // Case-insensitive check for Highland
  if (healthBoard.toUpperCase().includes("HIGHLAND")) {
    return "Highland";
  }
  
  // Case-insensitive check for Lanarkshire
  if (healthBoard.toUpperCase().includes("LANARK")) {
    return "Lanarkshire";
  }
  
  // Case-insensitive check for Ayrshire and Arran
  if (healthBoard.toUpperCase().includes("AYRSHIRE") || 
      healthBoard.toUpperCase().includes("ARRAN")) {
    return "A&A";
  }
  
  // Case-insensitive check for Borders
  if (healthBoard.toUpperCase().includes("BORDERS")) {
    return "Borders";
  }
  
  // Case-insensitive check for Forth Valley
  if (healthBoard.toUpperCase().includes("FORTH") || 
      healthBoard.toUpperCase().includes("VALLEY")) {
    return "Forth Valley";
  }
  
  // Case-insensitive check for Fife
  if (healthBoard.toUpperCase().includes("FIFE")) {
    return "Fife";
  }
  
  // Case-insensitive check for Dumfries and Galloway
  if (healthBoard.toUpperCase().includes("DUMFRIES") || 
      healthBoard.toUpperCase().includes("GALLOWAY") ||
      healthBoard.toUpperCase().includes("D&G")) {
    return "D&G";
  }
  
  // Case-insensitive check for Western Isles
  if (healthBoard.toUpperCase().includes("WESTERN") || 
      healthBoard.toUpperCase().includes("ISLES") || 
      healthBoard.toUpperCase().includes("EILEAN") || 
      healthBoard.toUpperCase().includes("SIAR")) {
    return "Western Isles";
  }
  
  // Case-insensitive check for Orkney
  if (healthBoard.toUpperCase().includes("ORKNEY")) {
    return "Orkney";
  }
  
  // Case-insensitive check for Shetland
  if (healthBoard.toUpperCase().includes("SHETLAND")) {
    return "Shetland";
  }
  
  // Remove NHS prefix if present (case insensitive)
  const formattedName = healthBoard.replace(/^NHS\s+/i, "").trim();
  
  // If we have a formatted name, return it, otherwise return NHS
  return formattedName || "NHS";
};

const DashboardContent = ({ userId, documents, loading }: DashboardContentProps) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");
  const [firstName, setFirstName] = useState<string>("");
  const isMobile = useIsMobile();
  
  // Update debugging state to show all components by default
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [showKeyMetrics, setShowKeyMetrics] = useState<boolean>(true);
  const [showLineChart, setShowLineChart] = useState<boolean>(true);
  const [showAIInsights, setShowAIInsights] = useState<boolean>(true);
  const [showItemsBreakdown, setShowItemsBreakdown] = useState<boolean>(true);
  const [showFinancialBreakdown, setShowFinancialBreakdown] = useState<boolean>(true);
  const [showPaymentVariance, setShowPaymentVariance] = useState<boolean>(true);
  const [showPrescriptionVolume, setShowPrescriptionVolume] = useState<boolean>(true);
  const [showPharmacyFirst, setShowPharmacyFirst] = useState<boolean>(true);
  const [showSupplementaryPayments, setShowSupplementaryPayments] = useState<boolean>(true);
  const [showHighValueItems, setShowHighValueItems] = useState<boolean>(true);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState<boolean>(true);
  
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
        
        console.log(`Document ${doc.month} ${doc.year}: 
          - Has PFS details object: ${hasPfsDetails ? 'Yes' : 'No'}
          - PFS details has non-null values: ${pfsDetailsHasData ? 'Yes' : 'No'}
          - Has supplementary payments: ${hasSupplementaryPayments ? 'Yes' : 'No'}
          - Supplementary payments details: ${hasSupplementaryPayments ? 
            `${doc.supplementaryPayments.details.length} entries` : 'None'}
          - Pharmacy First Base Payment: ${doc.financials?.pharmacyFirstBase !== undefined ? doc.financials.pharmacyFirstBase : 'Not available'}
          - Pharmacy First Activity Payment: ${doc.financials?.pharmacyFirstActivity !== undefined ? doc.financials.pharmacyFirstActivity : 'Not available'}
          - NHS PFS Items: ${doc.itemCounts?.nhsPfs || 'Not available'}`
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
                 `${selectedDoc.supplementaryPayments.details?.length || 0} entries` : 
                 'none');
      console.log("Document source:", selectedDoc.id ? "from documents table" : "unknown source");
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
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto">
              <Card className="bg-white hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Contractor Code</div>
                  <div className="font-bold text-base sm:text-xl">{currentData.contractorCode || "1737"}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-gray-600">Health Board</div>
                  <div className="font-bold text-base sm:text-xl">
                    {(() => {
                      console.log("Health board from data:", currentData.healthBoard);
                      
                      // DIRECT FIX: If it's showing as NHS, display GG&C instead
                      if (!currentData.healthBoard || 
                          currentData.healthBoard === "NHS" || 
                          currentData.healthBoard === "") {
                        console.log("Replacing NHS with GG&C as requested");
                        return "GG&C";
                      }
                      
                      // Otherwise continue with normal processing
                      const healthBoardUpper = currentData.healthBoard.toUpperCase();
                      console.log("Upper case health board:", healthBoardUpper);
                      
                      // Check for NHS GREATER GLASGOW & CLYDE (exact match first)
                      if (healthBoardUpper === "NHS GREATER GLASGOW & CLYDE" || 
                          healthBoardUpper === "NHS GREATER GLASGOW AND CLYDE") {
                        console.log("Exact match for NHS GREATER GLASGOW & CLYDE");
                        return "GG&C";
                      }
                      
                      // Now check for partial matches
                      if ((healthBoardUpper.includes("GLASGOW") && healthBoardUpper.includes("CLYDE")) ||
                          healthBoardUpper.includes("GG&C") || 
                          healthBoardUpper.includes("GGC")) {
                        console.log("Partial match for Glasgow and Clyde");
                        return "GG&C";
                      }
                      
                      const formattedBoard = formatHealthBoard(currentData.healthBoard);
                      console.log("Formatted health board:", formattedBoard);
                      return formattedBoard;
                    })()}
                  </div>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">Payment Details</h3>
            <Select
              value={selectedMonth || ""}
              onValueChange={handleMonthSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {sortedDocuments.map((doc) => (
                  <SelectItem 
                    key={`${doc.month}-${doc.year}`} 
                    value={`${doc.month} ${doc.year}`}
                  >
                    {formatMonth(doc.month)} {doc.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {showKeyMetrics && (
            <KeyMetricsSummary 
              currentData={currentData} 
              previousData={previousMonthData}
              onMetricClick={setSelectedMetric}
            />
          )}
          
          {showLineChart && (
            <LineChartMetrics 
              documents={documents}
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
            />
          )}

          {showAIInsights && currentData && previousMonthData && (
            <AIInsightsPanel 
              currentDocument={currentData}
              previousDocument={previousMonthData}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showItemsBreakdown && (
              <ItemsBreakdown 
                currentData={currentData}
              />
            )}
            
            {showFinancialBreakdown && (
              <FinancialBreakdown 
                currentData={currentData}
              />
            )}
          </div>

          {showPaymentVariance && currentData && previousMonthData && (
            <PaymentVarianceAnalysis 
              currentData={currentData} 
              previousData={previousMonthData} 
            />
          )}

          {showPrescriptionVolume && currentData && (
            <ErrorBoundary fallback={<div>Error loading prescription volume analysis</div>}>
              <PrescriptionVolumeAnalysis 
                paymentData={currentData}
              />
            </ErrorBoundary>
          )}
          
          {showPharmacyFirst && currentData?.pfsDetails && (
            <ErrorBoundary fallback={<div>Error loading pharmacy first details</div>}>
              <PharmacyFirstDetails 
                currentData={currentData} 
                previousData={previousMonthData}
                month={currentData.month}
                year={currentData.year.toString()}
              />
            </ErrorBoundary>
          )}
          
          {showSupplementaryPayments && currentData?.supplementaryPayments && (
            <SupplementaryPaymentsTable 
              payments={currentData.supplementaryPayments}
            />
          )}
          
          {showHighValueItems && currentData?.highValueItems && (
            <HighValueItemsAnalysis 
              paymentData={currentData}
            />
          )}
          
          {showPaymentSchedule && currentData && (
            <PaymentScheduleDetails 
              currentData={currentData}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardContent;

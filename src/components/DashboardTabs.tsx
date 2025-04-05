
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentList from "./DocumentList";
import DocumentUpload from "./DocumentUpload";
import MonthlyComparison from "./MonthlyComparison";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import RegionalPaymentsChart from "./RegionalPaymentsChart";
import PaymentVarianceAnalysis from "./PaymentVarianceAnalysis";

interface DashboardTabsProps {
  user: User | null;
}

export interface PaymentData {
  id: string;
  month: string;
  year: number;
  totalItems: number;
  netPayment: number;
  contractorCode?: string;
  dispensingMonth?: string;
  itemCounts?: {
    total: number;
    ams?: number;
    mcr?: number;
    nhsPfs?: number;
    cpus?: number;
  };
  financials?: {
    grossIngredientCost?: number;
    netIngredientCost?: number;
    dispensingPool?: number;
    establishmentPayment?: number;
    pharmacyFirstBase?: number;
    pharmacyFirstActivity?: number;
    averageGrossValue?: number;
    supplementaryPayments?: number;
  };
  advancePayments?: {
    previousMonth?: number;
    nextMonth?: number;
  };
  serviceCosts?: {
    ams?: number;
    mcr?: number;
    nhsPfs?: number;
    cpus?: number;
    other?: number;
  };
  pfsDetails?: {
    treatmentItems?: number;
    consultations?: number;
    referrals?: number;
    weightedActivityTotal?: number;
    basePayment?: number;
    activityPayment?: number;
    totalPayment?: number;
  };
  regionalPayments?: {
    paymentDetails: Array<{
      description: string;
      amount: number;
    }>;
    totalAmount: number;
  };
}

// Helper type guards for more precise type checking
const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const DashboardTabs = ({ user }: DashboardTabsProps) => {
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDocuments();
  }, [user]);
  
  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform document data to PaymentData format
        const paymentData = data.map(doc => {
          // First check if extracted_data exists and is an object
          const extractedData = doc.extracted_data && isObject(doc.extracted_data) 
            ? doc.extracted_data as Record<string, any>
            : {};
            
          // Safely check and access properties
          const hasItemCounts = 'itemCounts' in extractedData && isObject(extractedData.itemCounts);
          const hasFinancials = 'financials' in extractedData && isObject(extractedData.financials);
          const hasAdvancePayments = 'advancePayments' in extractedData && isObject(extractedData.advancePayments);
          const hasServiceCosts = 'serviceCosts' in extractedData && isObject(extractedData.serviceCosts);
          const hasPfsDetails = 'pfsDetails' in extractedData && isObject(extractedData.pfsDetails);
          const hasRegionalPayments = 'regionalPayments' in extractedData && isObject(extractedData.regionalPayments);
          
          // Access with type safety
          const itemCountsData = hasItemCounts ? extractedData.itemCounts as Record<string, any> : {};
          const financialsData = hasFinancials ? extractedData.financials as Record<string, any> : {};
          const advancePaymentsData = hasAdvancePayments ? extractedData.advancePayments as Record<string, any> : {};
          const serviceCostsData = hasServiceCosts ? extractedData.serviceCosts as Record<string, any> : {};
          const pfsDetailsData = hasPfsDetails ? extractedData.pfsDetails as Record<string, any> : {};
          const regionalPaymentsData = hasRegionalPayments ? extractedData.regionalPayments as Record<string, any> : {};
          
          return {
            id: doc.id,
            month: doc.month || '',
            year: doc.year || new Date().getFullYear(),
            totalItems: hasItemCounts && 'total' in itemCountsData 
              ? Number(itemCountsData.total) 
              : 0,
            netPayment: 'netPayment' in extractedData 
              ? Number(extractedData.netPayment) 
              : 0,
            contractorCode: 'contractorCode' in extractedData 
              ? String(extractedData.contractorCode) 
              : undefined,
            dispensingMonth: 'dispensingMonth' in extractedData 
              ? String(extractedData.dispensingMonth) 
              : undefined,
            itemCounts: hasItemCounts 
              ? {
                  total: Number(itemCountsData.total || 0),
                  ams: 'ams' in itemCountsData ? Number(itemCountsData.ams) : undefined,
                  mcr: 'mcr' in itemCountsData ? Number(itemCountsData.mcr) : undefined,
                  nhsPfs: 'nhsPfs' in itemCountsData ? Number(itemCountsData.nhsPfs) : undefined,
                  cpus: 'cpus' in itemCountsData ? Number(itemCountsData.cpus) : undefined
                }
              : undefined,
            financials: hasFinancials
              ? {
                  grossIngredientCost: 'grossIngredientCost' in financialsData 
                    ? Number(financialsData.grossIngredientCost) 
                    : undefined,
                  netIngredientCost: 'netIngredientCost' in financialsData
                    ? Number(financialsData.netIngredientCost) 
                    : undefined,
                  dispensingPool: 'dispensingPool' in financialsData
                    ? Number(financialsData.dispensingPool) 
                    : undefined,
                  establishmentPayment: 'establishmentPayment' in financialsData
                    ? Number(financialsData.establishmentPayment) 
                    : undefined,
                  pharmacyFirstBase: 'pharmacyFirstBase' in financialsData
                    ? Number(financialsData.pharmacyFirstBase)
                    : undefined,
                  pharmacyFirstActivity: 'pharmacyFirstActivity' in financialsData
                    ? Number(financialsData.pharmacyFirstActivity)
                    : undefined,
                  averageGrossValue: 'averageGrossValue' in financialsData
                    ? Number(financialsData.averageGrossValue)
                    : undefined,
                  supplementaryPayments: 'supplementaryPayments' in financialsData
                    ? Number(financialsData.supplementaryPayments)
                    : undefined
                }
              : undefined,
            advancePayments: hasAdvancePayments
              ? {
                  previousMonth: 'previousMonth' in advancePaymentsData
                    ? Number(advancePaymentsData.previousMonth)
                    : undefined,
                  nextMonth: 'nextMonth' in advancePaymentsData
                    ? Number(advancePaymentsData.nextMonth)
                    : undefined
                }
              : undefined,
            serviceCosts: hasServiceCosts
              ? {
                  ams: 'ams' in serviceCostsData
                    ? Number(serviceCostsData.ams)
                    : undefined,
                  mcr: 'mcr' in serviceCostsData
                    ? Number(serviceCostsData.mcr)
                    : undefined,
                  nhsPfs: 'nhsPfs' in serviceCostsData
                    ? Number(serviceCostsData.nhsPfs)
                    : undefined,
                  cpus: 'cpus' in serviceCostsData
                    ? Number(serviceCostsData.cpus)
                    : undefined,
                  other: 'other' in serviceCostsData
                    ? Number(serviceCostsData.other)
                    : undefined
                }
              : undefined,
            pfsDetails: hasPfsDetails
              ? {
                  treatmentItems: 'treatmentItems' in pfsDetailsData
                    ? Number(pfsDetailsData.treatmentItems)
                    : undefined,
                  consultations: 'consultations' in pfsDetailsData
                    ? Number(pfsDetailsData.consultations)
                    : undefined,
                  referrals: 'referrals' in pfsDetailsData
                    ? Number(pfsDetailsData.referrals)
                    : undefined,
                  weightedActivityTotal: 'weightedActivityTotal' in pfsDetailsData
                    ? Number(pfsDetailsData.weightedActivityTotal)
                    : undefined,
                  basePayment: 'basePayment' in pfsDetailsData
                    ? Number(pfsDetailsData.basePayment)
                    : undefined,
                  activityPayment: 'activityPayment' in pfsDetailsData
                    ? Number(pfsDetailsData.activityPayment)
                    : undefined,
                  totalPayment: 'totalPayment' in pfsDetailsData
                    ? Number(pfsDetailsData.totalPayment)
                    : undefined
                }
              : undefined,
            regionalPayments: hasRegionalPayments && 'paymentDetails' in regionalPaymentsData && Array.isArray(regionalPaymentsData.paymentDetails)
              ? {
                  paymentDetails: regionalPaymentsData.paymentDetails.map((detail: any) => ({
                    description: String(detail.description || ''),
                    amount: Number(detail.amount || 0)
                  })),
                  totalAmount: 'totalAmount' in regionalPaymentsData ? Number(regionalPaymentsData.totalAmount) : 0
                }
              : undefined
          };
        });
        
        setDocuments(paymentData);
        
        // Set default selected month to the most recent month
        if (paymentData.length > 0 && !selectedMonth) {
          setSelectedMonth(`${paymentData[0].month} ${paymentData[0].year}`);
          
          // If there's more than one document, set comparison month to the second most recent
          if (paymentData.length > 1) {
            setComparisonMonth(`${paymentData[1].month} ${paymentData[1].year}`);
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
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
    
    // If the selected month is the current comparison month, swap them
    if (monthKey === comparisonMonth) {
      setComparisonMonth(selectedMonth);
    }
    
    setSelectedMonth(monthKey);
  };
  
  const handleComparisonSelect = (monthKey: string) => {
    if (monthKey === comparisonMonth) return;
    
    // If the comparison month is the current selected month, swap them
    if (monthKey === selectedMonth) {
      setSelectedMonth(comparisonMonth);
    }
    
    setComparisonMonth(monthKey);
  };

  return (
    <Tabs defaultValue="documents" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>
      
      <TabsContent value="documents" className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
          <DocumentList userId={user?.id} onUpdate={fetchDocuments} />
        </div>
      </TabsContent>
      
      <TabsContent value="upload" className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          <DocumentUpload userId={user?.id} />
        </div>
      </TabsContent>
      
      <TabsContent value="dashboard" className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Schedule Dashboard</h2>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          ) : documents.length < 1 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No payment schedules available. Please upload some documents.</p>
            </div>
          ) : (
            <>
              <MonthlyComparison 
                userId={user?.id || ''}
                currentDocument={getSelectedData()}
                comparisonDocument={getComparisonData()}
                documentList={documents}
                onSelectMonth={handleMonthSelect}
                onSelectComparison={handleComparisonSelect}
                selectedMonth={selectedMonth}
                comparisonMonth={comparisonMonth}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {getSelectedData()?.regionalPayments && (
                  <RegionalPaymentsChart regionalPayments={getSelectedData()?.regionalPayments} />
                )}
                
                <PaymentVarianceAnalysis 
                  currentData={getSelectedData()} 
                  previousData={getComparisonData()} 
                />
              </div>
            </>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

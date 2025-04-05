
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentList from "./DocumentList";
import DocumentUpload from "./DocumentUpload";
import MonthlyComparison from "./MonthlyComparison";
import { toast } from "@/hooks/use-toast";

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
  };
}

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
          const extractedData = doc.extracted_data || {};
          return {
            id: doc.id,
            month: doc.month || '',
            year: doc.year || new Date().getFullYear(),
            totalItems: extractedData?.itemCounts?.total || 0,
            netPayment: extractedData?.netPayment || 0,
            contractorCode: extractedData?.contractorCode,
            dispensingMonth: extractedData?.dispensingMonth,
            itemCounts: extractedData?.itemCounts,
            financials: extractedData?.financials
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
            <MonthlyComparison 
              documents={documents}
              selectedMonth={selectedMonth}
              comparisonMonth={comparisonMonth}
              onSelectMonth={handleMonthSelect}
              onSelectComparison={handleComparisonSelect}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

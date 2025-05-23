import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { PaymentData } from "@/types/paymentTypes";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";
import DocumentsTab from "./DocumentsTab";
import UploadTab from "./UploadTab";
import DashboardTab from "./DashboardTab";

interface DashboardTabsProps {
  user: User | null;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardTabs = ({ user, activeTab = "dashboard", onTabChange }: DashboardTabsProps) => {
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDocuments();
  }, [user]);
  
  const getMonthIndex = (monthName: string): number => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(monthName);
  };
  
  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Fetched documents:', data);
        const paymentData = data.map(transformDocumentToPaymentData);
        console.log('Transformed payment data:', paymentData);
        
        const pfsDataCount = paymentData.filter(doc => 
          doc.pfsDetails && Object.keys(doc.pfsDetails).length > 0
        ).length;
        console.log(`Found ${pfsDataCount} out of ${paymentData.length} documents with PFS data`);
        
        const sortedPaymentData = paymentData.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          
          return getMonthIndex(b.month) - getMonthIndex(a.month);
        });
        
        setDocuments(sortedPaymentData);
      } else {
        console.log('No documents found');
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleValueChange} className="w-full">
      <TabsList className="hidden">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="documents">Documents History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="space-y-4">
        <DashboardTab 
          userId={user?.id || ''}
          documents={documents}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="upload" className="space-y-4">
        <UploadTab userId={user?.id || ''} />
      </TabsContent>
      
      <TabsContent value="documents" className="space-y-4">
        <DocumentsTab userId={user?.id || ''} onUpdate={fetchDocuments} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

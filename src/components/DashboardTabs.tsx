
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
}

const DashboardTabs = ({ user }: DashboardTabsProps) => {
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        console.log('Fetched documents:', data);
        // Transform document data to PaymentData format
        const paymentData = data.map(transformDocumentToPaymentData);
        console.log('Transformed payment data:', paymentData);
        setDocuments(paymentData);
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

  return (
    <Tabs defaultValue="documents" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      </TabsList>
      
      <TabsContent value="documents" className="space-y-4">
        <DocumentsTab userId={user?.id || ''} onUpdate={fetchDocuments} />
      </TabsContent>
      
      <TabsContent value="upload" className="space-y-4">
        <UploadTab userId={user?.id || ''} />
      </TabsContent>
      
      <TabsContent value="dashboard" className="space-y-4">
        <DashboardTab 
          userId={user?.id || ''}
          documents={documents}
          loading={loading}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

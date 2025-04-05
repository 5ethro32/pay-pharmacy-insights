
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, LayoutDashboard, MessageSquareText } from "lucide-react";
import DashboardContent from "./DashboardContent";
import UploadTab from "./UploadTab";
import DocumentsTab from "./DocumentsTab";
import ChatbotTab from "./ChatbotTab";
import { toast } from "@/hooks/use-toast";
import DashboardTab from "./DashboardTab";
import { PaymentData } from "@/types/paymentTypes";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";

interface DashboardTabsProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs = ({ user, activeTab, onTabChange }: DashboardTabsProps) => {
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchDocuments = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("pharmacy_schedules")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match PaymentData type
        const transformedData = data?.map(item => ({
          id: item.id,
          month: item.month,
          year: item.year,
          totalItems: item.total_items,
          netPayment: item.net_payment,
          // Add other required fields from PaymentData
          itemCounts: { total: item.total_items },
          // Add any other fields that might be in the data
          ...(item.data && typeof item.data === 'object' ? item.data : {})
        })) as PaymentData[];
        
        setDocuments(transformedData || []);
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch payment schedules. " + error.message,
          variant: "destructive",
        });
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user]);

  return (
    <div className="space-y-6">
      <nav className="flex border-b border-gray-200">
        <DashboardTab
          userId={user?.id || ''}
          documents={documents}
          loading={loading}
          icon={<LayoutDashboard className="h-4 w-4" />}
          isActive={activeTab === "dashboard"}
          onClick={() => onTabChange("dashboard")}
        >
          Dashboard
        </DashboardTab>
        <DashboardTab
          userId={user?.id || ''}
          documents={documents}
          loading={loading}
          icon={<Upload className="h-4 w-4" />}
          isActive={activeTab === "upload"}
          onClick={() => onTabChange("upload")}
        >
          Upload
        </DashboardTab>
        <DashboardTab
          userId={user?.id || ''}
          documents={documents}
          loading={loading}
          icon={<FileText className="h-4 w-4" />}
          isActive={activeTab === "documents"}
          onClick={() => onTabChange("documents")}
        >
          Document History
        </DashboardTab>
        <DashboardTab
          userId={user?.id || ''}
          documents={documents}
          loading={loading}
          icon={<MessageSquareText className="h-4 w-4" />}
          isActive={activeTab === "chatbot"}
          onClick={() => onTabChange("chatbot")}
        >
          AI Assistant
        </DashboardTab>
      </nav>
      
      <div className="mt-6">
        {activeTab === "dashboard" && (
          <DashboardContent 
            userId={user?.id || ''} 
            documents={documents} 
            loading={loading} 
          />
        )}
        {activeTab === "upload" && (
          <UploadTab userId={user?.id || ''} />
        )}
        {activeTab === "documents" && (
          <DocumentsTab 
            userId={user?.id || ''}
            onUpdate={() => {
              // Refresh documents list
              onTabChange("documents");
            }}
          />
        )}
        {activeTab === "chatbot" && (
          <ChatbotTab />
        )}
      </div>
    </div>
  );
};

export default DashboardTabs;

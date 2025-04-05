
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
          .from("payment_schedules")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        setDocuments(data || []);
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
          label="Dashboard"
          isActive={activeTab === "dashboard"}
          onClick={() => onTabChange("dashboard")}
          icon={<LayoutDashboard className="h-4 w-4" />}
        />
        <DashboardTab
          label="Upload"
          isActive={activeTab === "upload"}
          onClick={() => onTabChange("upload")}
          icon={<Upload className="h-4 w-4" />}
        />
        <DashboardTab
          label="Document History"
          isActive={activeTab === "documents"}
          onClick={() => onTabChange("documents")}
          icon={<FileText className="h-4 w-4" />}
        />
        <DashboardTab
          label="AI Assistant"
          isActive={activeTab === "chatbot"}
          onClick={() => onTabChange("chatbot")}
          icon={<MessageSquareText className="h-4 w-4" />}
        />
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
          <UploadTab user={user} />
        )}
        {activeTab === "documents" && (
          <DocumentsTab 
            user={user}
            documents={documents}
            loading={loading}
            onDeleteSuccess={() => {
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import PeerComparison from "@/components/PeerComparison";

const mapDocumentToPaymentData = (document: any): PaymentData => {
  const extractedData = document.extracted_data || {};
  
  let supplementaryPayments = 0;
  if (typeof extractedData === 'object' && !Array.isArray(extractedData)) {
    if (extractedData.financials && typeof extractedData.financials === 'object') {
      supplementaryPayments = extractedData.financials.supplementaryPayments || 0;
    }
  }
  
  let averageItemValue = 0;
  
  if (document.averageItemValue !== undefined) {
    averageItemValue = document.averageItemValue;
  } 
  else if (typeof extractedData === 'object' && !Array.isArray(extractedData) && extractedData.averageItemValue !== undefined) {
    averageItemValue = extractedData.averageItemValue;
  }
  else if (document.financials && document.financials.averageGrossValue !== undefined) {
    averageItemValue = document.financials.averageGrossValue;
  }
  else if (typeof extractedData === 'object' && 
          !Array.isArray(extractedData) && 
          extractedData.financials && 
          extractedData.financials.averageGrossValue !== undefined) {
    averageItemValue = extractedData.financials.averageGrossValue;
  }
  
  return {
    id: document.id,
    month: document.month || (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.month : '') || '',
    year: document.year || (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.year : new Date().getFullYear()),
    totalItems: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.totalItems || (extractedData.itemCounts?.total) : 0) || 0,
    netPayment: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.netPayment : 0) || 0,
    averageItemValue: averageItemValue,
    itemCounts: {
      total: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.totalItems || (extractedData.itemCounts?.total) : 0) || 0,
    },
    financials: {
      netIngredientCost: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? 
                         extractedData.ingredientCost || (extractedData.financials?.netIngredientCost) : 0) || 0,
      feesAllowances: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? 
                    extractedData.feesAllowances || (extractedData.financials?.feesAllowances) : 0) || 0,
      deductions: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? 
                 extractedData.deductions || (extractedData.financials?.deductions) : 0) || 0,
      supplementaryPayments: supplementaryPayments,
      averageGrossValue: averageItemValue
    },
    contractorCode: document.contractorCode || '',
    dispensingMonth: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.dispensingMonth : '') || '',
    healthBoard: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.healthBoard : '') || '',
    pfsDetails: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.pfsDetails : {}) || {},
    extracted_data: document.extracted_data
  };
};

const PeerComparisonPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PaymentData | null>(null);
  const [peerData, setPeerData] = useState<any[]>([]);
  const [isPremium] = useState<boolean>(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      fetchDocuments(session.user.id);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
          fetchDocuments(session.user.id);
        }
      }
    );

    getUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchDocuments = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data: currentUserData, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) throw error;
      
      if (!currentUserData || currentUserData.length === 0) {
        toast({
          title: "No data available",
          description: "Please upload some pharmacy schedules to compare with peers.",
          variant: "destructive",
        });
        setDocuments([]);
        setPeerData([]);
      } else {
        const mappedData = currentUserData.map(mapDocumentToPaymentData);
        console.log("Current user documents:", mappedData);
        setDocuments(mappedData);
        setSelectedDocument(mappedData[0]);
        
        fetchAnonymizedPeerData(userId);
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

  const fetchAnonymizedPeerData = async (currentUserId: string) => {
    try {
      console.log("Fetching peer data for user:", currentUserId);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .neq('user_id', currentUserId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("No peer data found");
        toast({
          title: "No peer data available",
          description: "There are currently no other pharmacies to compare with.",
          variant: "destructive",
        });
        setPeerData([]);
      } else {
        console.log("Raw peer data:", data);
        const validPeerData = data.map(item => {
          const mappedData = mapDocumentToPaymentData(item);
          console.log(`Peer ${item.id} data:`, mappedData);
          const avgValuePerItem = mappedData.totalItems > 0 ? 
            mappedData.netPayment / mappedData.totalItems : 0;
          return avgValuePerItem <= 100 ? mappedData : null;
        }).filter(item => item !== null);
        
        console.log("Processed peer data:", validPeerData);
        setPeerData(validPeerData);
      }
    } catch (error: any) {
      console.error('Error fetching peer data:', error);
      toast({
        title: "Error loading peer data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <AppSidebar activePage="peer-comparison" isPremium={isPremium} />
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <DashboardHeader 
              user={user} 
              onSignOut={handleSignOut}
              isPremium={isPremium}
            />
            <main className="flex-1 overflow-x-hidden w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
              <Card className="mb-8 w-full">
                <CardContent className="px-3 sm:px-6">
                  <div className="w-full overflow-x-auto">
                    <PeerComparison 
                      userId={user?.id || ''} 
                      documentList={documents}
                      peerData={peerData}
                      loading={loading}
                    />
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default PeerComparisonPage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import PeerComparison from "@/components/PeerComparison";

const mapDocumentToPaymentData = (document: any): PaymentData => {
  const extractedData = document.extracted_data || {};
  
  return {
    id: document.id,
    month: document.month || (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.month : '') || '',
    year: document.year || (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.year : new Date().getFullYear()),
    totalItems: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.totalItems || (extractedData.itemCounts?.total) : 0) || 0,
    netPayment: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.netPayment : 0) || 0,
    itemCounts: {
      total: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.totalItems || (extractedData.itemCounts?.total) : 0) || 0,
    },
    financials: {
      netIngredientCost: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? 
                         extractedData.ingredientCost || (extractedData.financials?.netIngredientCost) : 0) || 0,
      feesAllowances: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? 
                    extractedData.feesAllowances || (extractedData.financials?.feesAllowances) : 0) || 0,
      deductions: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? 
                 extractedData.deductions || (extractedData.financials?.deductions) : 0) || 0
    },
    contractorCode: document.contractorCode || '',
    dispensingMonth: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.dispensingMonth : '') || '',
    pfsDetails: (typeof extractedData === 'object' && !Array.isArray(extractedData) ? extractedData.pfsDetails : {}) || {},
    extracted_data: document.extracted_data // Keep original data
  };
};

const PeerComparisonPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<PaymentData[]>([]);
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
        console.log("Current user data:", currentUserData);
        const mappedData = currentUserData.map(mapDocumentToPaymentData);
        setDocuments(mappedData);
        
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
      
      console.log("Raw peer data response:", data);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("No peer data found in the database");
        toast({
          title: "No peer data available",
          description: "There are currently no other pharmacies to compare with.",
          variant: "destructive",
        });
        setPeerData([]);
      } else {
        const mappedPeerData = data.map(mapDocumentToPaymentData);
        console.log("Processed peer data:", mappedPeerData);
        setPeerData(mappedPeerData);
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
              <div className="w-full mx-auto max-w-full mb-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Peer Comparison
                    </h1>
                    <p className="text-gray-600 mt-1">Compare your pharmacy's performance with anonymised peers over time</p>
                  </div>
                </div>
              </div>
              
              <Card className="mb-8 w-full">
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl text-gray-800">Performance Analysis</CardTitle>
                      <CardDescription>Your pharmacy vs. anonymised regional peers across all available months</CardDescription>
                    </div>
                  </div>
                </CardHeader>
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

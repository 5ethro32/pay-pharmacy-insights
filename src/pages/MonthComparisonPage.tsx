import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { PaymentData } from "@/types/paymentTypes";
import MonthlyComparison from "@/components/MonthlyComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const MonthComparisonPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [comparisonMonthKey, setComparisonMonthKey] = useState<string>("");
  const [isPremium] = useState<boolean>(true);
  const isMobile = useIsMobile();

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

    getUser();
    
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchDocuments = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const paymentData = data.map(transformDocumentToPaymentData);
        
        const sortedPaymentData = paymentData.sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          
          const getMonthIndex = (monthName: string): number => {
            const months = [
              "January", "February", "March", "April", "May", "June", 
              "July", "August", "September", "October", "November", "December"
            ];
            return months.indexOf(monthName);
          };
          
          return getMonthIndex(b.month) - getMonthIndex(a.month);
        });
        
        setDocuments(sortedPaymentData);
        
        if (sortedPaymentData.length > 0) {
          setSelectedMonthKey(`${sortedPaymentData[0].month} ${sortedPaymentData[0].year}`);
          
          if (sortedPaymentData.length > 1) {
            setComparisonMonthKey(`${sortedPaymentData[1].month} ${sortedPaymentData[1].year}`);
          }
        }
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

  const handleSelectMonth = (monthKey: string) => {
    setSelectedMonthKey(monthKey);
  };

  const handleSelectComparison = (monthKey: string) => {
    setComparisonMonthKey(monthKey);
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

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      navigate("/dashboard");
    } else if (tab === "upload") {
      navigate("/dashboard", { state: { activeTab: "upload" } });
    } else if (tab === "documents") {
      navigate("/dashboard", { state: { activeTab: "documents" } });
    }
  };

  const currentDocument = documents.find(doc => 
    `${doc.month} ${doc.year}` === selectedMonthKey
  ) || (documents.length > 0 ? documents[0] : null);
  
  const comparisonDocument = documents.find(doc => 
    `${doc.month} ${doc.year}` === comparisonMonthKey
  ) || (documents.length > 1 ? documents[1] : null);

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
          <AppSidebar activePage="month-comparison" isPremium={isPremium} />
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <DashboardHeader 
              user={user} 
              onSignOut={handleSignOut}
              isPremium={isPremium}
            />
            <main className="flex-1 overflow-x-hidden w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
              <div className="w-full mx-auto max-w-full">
                <Card className="mb-8 w-full">
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl text-gray-800">Monthly Comparison</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="w-full overflow-x-auto">
                      <MonthlyComparison 
                        userId={user?.id || ''} 
                        documentList={documents} 
                        loading={loading}
                        currentDocument={currentDocument}
                        comparisonDocument={comparisonDocument}
                        selectedMonth={selectedMonthKey}
                        comparisonMonth={comparisonMonthKey}
                        onSelectMonth={setSelectedMonthKey}
                        onSelectComparison={setComparisonMonthKey}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MonthComparisonPage;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import { PaymentData } from "@/types/paymentTypes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import UserProfile from "@/components/UserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import PeerComparison from "@/components/PeerComparison";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const PeerComparisonPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [peerData, setPeerData] = useState<any[]>([]);
  const [isPremium] = useState<boolean>(true); // Premium user status
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
      fetchAnonymizedPeerData();
    };

    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
          fetchDocuments(session.user.id);
          fetchAnonymizedPeerData();
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

  // Fetch anonymized peer data for comparison
  const fetchAnonymizedPeerData = async () => {
    try {
      // In a real application, this would fetch anonymized data from other pharmacies
      // For demonstration purposes, we'll simulate with pharmacy_schedules data
      const { data, error } = await supabase
        .from('pharmacy_schedules')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Anonymize the data by removing user_id and generating anonymous identifiers
        const anonymizedData = data.map((item, index) => ({
          ...item,
          pharmacy_id: `Pharmacy-${String.fromCharCode(65 + (index % 26))}`, // A, B, C, etc.
          user_id: undefined // Remove actual user_id for privacy
        }));
        
        setPeerData(anonymizedData);
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
            />
            <main className="flex-1 overflow-x-hidden w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
              <div className="w-full mx-auto max-w-full mb-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      Peer Comparison
                      <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                        <Star className="h-3 w-3 mr-1" fill="white" />
                        Premium
                      </Badge>
                    </h1>
                    <p className="text-gray-600 mt-1">Compare your pharmacy's performance with anonymized peers</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <UserProfile user={user} isPremium={isPremium} />
                  </div>
                </div>
              </div>
              
              <Card className="mb-8 w-full">
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl text-gray-800">Pharmacy Performance Comparison</CardTitle>
                      <CardDescription>Your pharmacy vs. anonymized regional peers</CardDescription>
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

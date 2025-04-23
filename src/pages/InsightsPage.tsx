import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { transformDocumentToPaymentData } from "@/utils/paymentDataUtils";
import { PaymentData } from "@/types/paymentTypes";
import { toast } from "@/hooks/use-toast";
import EmptyInsights from "@/components/Empty";

const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<PaymentData[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [aiScore, setAiScore] = useState<{ positive: number; negative: number }>({ positive: 0, negative: 0 });
  const [peerData, setPeerData] = useState<PaymentData[]>([]);
  const [peerLoading, setPeerLoading] = useState<boolean>(false);
  const [isPremium] = useState<boolean>(true);
  const isMobile = useIsMobile();

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
    }
  };

  // Fetch user session and documents
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        fetchDocuments(session.user.id);
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Load and sort documents
  const fetchDocuments = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      if (data && data.length > 0) {
        const paymentData = data.map(transformDocumentToPaymentData);
        const sorted = paymentData.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          const months = [
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
          ];
          return months.indexOf(b.month) - months.indexOf(a.month);
        });
        setDocuments(sorted);
        // default selection
        setSelectedMonthKey(`${sorted[0].month} ${sorted[0].year}`);
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error fetching documents", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Compute current and previous documents based on selectedMonthKey
  const currentDocument =
    documents.find(doc => `${doc.month} ${doc.year}` === selectedMonthKey) || null;
  // Find previous month document in sorted list
  const previousDocument = (() => {
    if (!currentDocument) return null;
    const idx = documents.findIndex(doc => `${doc.month} ${doc.year}` === selectedMonthKey);
    return idx >= 0 && idx + 1 < documents.length ? documents[idx + 1] : null;
  })();

  useEffect(() => {
    // Fetch peer data for selected month
    const fetchPeerData = async () => {
      if (!currentDocument || !user) return;
      setPeerLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('month', currentDocument.month)
          .eq('year', currentDocument.year)
          .neq('user_id', user.id);
        if (error) throw error;
        const peerTransformed = data.map(transformDocumentToPaymentData);
        setPeerData(peerTransformed);
      } catch (err: any) {
        console.error('Error fetching peer data', err);
      } finally {
        setPeerLoading(false);
      }
    };
    fetchPeerData();
  }, [currentDocument, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <AppSidebar activePage="insights" isPremium={isPremium} />
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <DashboardHeader user={user} onSignOut={handleSignOut} isPremium={isPremium} />
            <main className="flex-1 w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
              <div className="max-w-4xl mx-auto">
                <EmptyInsights />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default InsightsPage; 
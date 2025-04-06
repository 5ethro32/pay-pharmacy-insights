import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardTabs from "@/components/DashboardTabs";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  useEffect(() => {
    // Check for tab param in URL query string
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    
    if (tabParam && ['upload', 'documents'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Check for state passed during navigation
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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
    setActiveTab(tab);
  };

  useEffect(() => {
    // Update the document title
    document.title = "Pharmacy Analytics Dashboard | ePSchedule";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar activePage="dashboard" />
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <DashboardHeader 
              user={user} 
              onSignOut={handleSignOut} 
              onTabChange={handleTabChange} 
            />
            <main className="flex-1 overflow-x-hidden px-2 sm:px-4 py-4 sm:py-6 w-full max-w-full">
              <div className="w-full max-w-full overflow-hidden">
                <DashboardTabs 
                  user={user} 
                  activeTab={activeTab} 
                  onTabChange={handleTabChange} 
                />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;

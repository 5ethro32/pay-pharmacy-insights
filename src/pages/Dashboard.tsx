
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardTabs from "@/components/DashboardTabs";
import AppSidebar from "@/components/AppSidebar";
import { useSidebar } from "@/components/ui/sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { state } = useSidebar();
  
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

  const sidebarExpanded = state === 'expanded';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden md:block">
        <AppSidebar activePage="dashboard" />
      </div>
      
      <div className={`flex-1 flex flex-col w-full ${sidebarExpanded ? 'md:ml-[240px]' : 'md:ml-[80px]'} transition-all duration-300`}>
        <DashboardHeader 
          user={user} 
          onSignOut={handleSignOut} 
          onTabChange={handleTabChange} 
        />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <DashboardTabs 
            user={user} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

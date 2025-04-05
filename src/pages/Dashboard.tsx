
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardTabs from "@/components/DashboardTabs";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { BarChart3, Calendar, Database, FileSpreadsheet, LayoutDashboard, Users, User as UserIcon } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
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
  
  const handleComparisonSelect = (type: string) => {
    setActiveTab("dashboard");
    // We'll use this later to manage comparison state
    console.log("Selected comparison type:", type);
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
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar onComparisonSelect={handleComparisonSelect} />
          <div className="flex-1">
            <DashboardHeader 
              user={user} 
              onSignOut={handleSignOut} 
              onTabChange={handleTabChange} 
            />
            <main className="container mx-auto px-4 py-8">
              <div className="flex items-center mb-4">
                <SidebarTrigger className="mr-2" />
              </div>
              <DashboardTabs 
                user={user} 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
              />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

interface AppSidebarProps {
  onComparisonSelect: (type: string) => void;
}

const AppSidebar = ({ onComparisonSelect }: AppSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <BarChart3 className="h-6 w-6 text-red-800 mr-2" />
          <span className="font-bold text-lg">ePSchedule</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <a href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Documents">
                  <a href="/dashboard?tab=documents">
                    <Database />
                    <span>Documents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Upload">
                  <a href="/dashboard?tab=upload">
                    <FileSpreadsheet />
                    <span>Upload</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Comparisons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onComparisonSelect("monthly")}
                  tooltip="Month Comparison">
                  <Calendar />
                  <span>Month Comparison</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onComparisonSelect("group")}
                  tooltip="Group Comparison">
                  <Users />
                  <span>Group Comparison</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => onComparisonSelect("peer")}
                  tooltip="Peer Comparison">
                  <UserIcon />
                  <span>Peer Comparison</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default Dashboard;

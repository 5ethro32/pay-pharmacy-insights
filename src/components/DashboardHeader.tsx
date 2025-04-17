import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import NotificationsPopover from "@/components/NotificationsPopover";
import { Badge, Star, ShieldCheck } from "lucide-react";

interface DashboardHeaderProps {
  user: User | null;
  onSignOut: () => void;
  onTabChange?: (tab: string) => void;
  isPremium?: boolean;
}

interface Profile {
  full_name: string | null;
  pharmacy_name: string | null;
}

const DashboardHeader = ({ user, onSignOut, onTabChange, isPremium = false }: DashboardHeaderProps) => {
  const [profile, setProfile] = useState<Profile>({ full_name: null, pharmacy_name: null });
  const [hasNotifications, setHasNotifications] = useState(true);
  const navigate = useNavigate();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, pharmacy_name")
        .eq("id", user.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    };
    
    getProfile();
  }, [user]);
  
  useEffect(() => {
    // Check if we should show notifications by checking localStorage
    const lastNotificationCheck = localStorage.getItem('lastNotificationCheck');
    const now = new Date().getTime();
    
    // If we haven't checked in the last 24 hours, show the notification
    if (!lastNotificationCheck || (now - parseInt(lastNotificationCheck)) > 24 * 60 * 60 * 1000) {
      setHasNotifications(true);
      localStorage.setItem('lastNotificationCheck', now.toString());
    }
  }, []);
  
  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return "U";
  };

  const handleLogoClick = (event: React.MouseEvent) => {
    // Prevent default link behavior
    event.preventDefault();
    
    // Set a flag in sessionStorage to indicate we're navigating programmatically
    sessionStorage.setItem('keepSidebarClosed', 'true');
    
    // Force a complete page reload for the dashboard
    window.location.href = '/dashboard';
    
    // Ensure mobile sidebar is closed when navigating
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden mr-2 p-1"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            )}
            
            <a 
              href="/dashboard"
              onClick={handleLogoClick}
              className="flex items-center bg-transparent border-none cursor-pointer"
            >
              <span className="text-red-900 font-display font-bold text-2xl">e</span>
              <span className="text-red-800 font-display font-bold text-2xl">PSchedule</span>
              {isPremium && (
                <div className="ml-2 flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                    <Star className="h-3 w-3 mr-1" fill="white" />
                    Premium
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                </div>
              )}
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationsPopover 
              hasNotifications={hasNotifications} 
              setHasNotifications={setHasNotifications}
            />
            
            <div className="hidden md:flex items-center gap-3 border-l pl-4 border-gray-200">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-red-700 to-red-900 text-white font-medium">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="hidden md:flex flex-col">
                <span className="font-medium text-sm">{profile.full_name || "User"}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSignOut}
                className="ml-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

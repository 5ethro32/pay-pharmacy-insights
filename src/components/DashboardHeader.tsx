
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  user: User | null;
  onSignOut: () => void;
  onTabChange?: (tab: string) => void;
}

interface Profile {
  full_name: string | null;
  pharmacy_name: string | null;
}

const DashboardHeader = ({ user, onSignOut }: DashboardHeaderProps) => {
  const [profile, setProfile] = useState<Profile>({ full_name: null, pharmacy_name: null });
  const [hasNotifications, setHasNotifications] = useState(true); // Example state for notification indicator
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

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

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Logo */}
        <div className="flex items-center">
          <button 
            onClick={handleLogoClick}
            className="flex items-center bg-transparent border-none cursor-pointer"
          >
            <span className="text-red-900 font-display font-bold text-xl md:text-2xl">eP</span>
            <span className="text-red-800 font-display font-bold text-xl md:text-2xl">Schedule</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
            >
              <Bell className="h-5 w-5" />
            </Button>
            {hasNotifications && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full"></span>
            )}
          </div>
          
          <div className="flex items-center gap-1 md:gap-3 border-l pl-2 md:pl-4 border-gray-200">
            <Avatar className="h-8 w-8 md:h-9 md:w-9">
              <AvatarFallback className="bg-gradient-to-br from-red-700 to-red-900 text-white text-xs md:text-sm font-medium">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="hidden md:flex flex-col">
              <span className="font-medium text-sm">{profile.full_name || "User"}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSignOut}
              className="ml-0 md:ml-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

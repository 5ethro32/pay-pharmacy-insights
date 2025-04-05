
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Bell, LogOut, Upload, FileText, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  user: User | null;
  onSignOut: () => void;
  onTabChange?: (tab: string) => void;
}

interface Profile {
  full_name: string | null;
  pharmacy_name: string | null;
}

const DashboardHeader = ({ user, onSignOut, onTabChange }: DashboardHeaderProps) => {
  const [profile, setProfile] = useState<Profile>({ full_name: null, pharmacy_name: null });
  const [hasNotifications, setHasNotifications] = useState(true); // Example state for notification indicator

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

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-red-900 font-display font-bold text-2xl">eP</span>
              <span className="text-red-800 font-display font-bold text-2xl">Schedule</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 ml-12">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 font-medium"
                onClick={() => handleTabChange('dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 font-medium"
                onClick={() => handleTabChange('upload')}
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 font-medium"
                onClick={() => handleTabChange('documents')}
              >
                <FileText className="h-4 w-4" />
                Documents History
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
            
            <div className="hidden md:flex items-center gap-3 border-l pl-4 border-gray-200">
              <Avatar className="h-9 w-9 bg-red-800 text-white">
                <AvatarFallback>{getInitials()}</AvatarFallback>
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

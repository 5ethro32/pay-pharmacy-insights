
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { LogOut, Upload, FileText, LayoutDashboard } from "lucide-react";
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
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-red-900 font-display font-bold text-2xl">eP</span>
              <span className="ml-0 text-red-800 font-display font-bold text-2xl">Schedule</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => handleTabChange('dashboard')}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => handleTabChange('upload')}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => handleTabChange('documents')}
            >
              <FileText className="h-4 w-4" />
              Documents History
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-medium">{profile.full_name}</span>
              <span className="text-sm text-gray-500">{profile.pharmacy_name}</span>
            </div>
            
            <Avatar className="h-10 w-10 bg-red-800 text-white">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="hidden md:flex"
            >
              Sign Out <LogOut className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;


import React from 'react';
import { User } from "@supabase/supabase-js";
import { 
  Star,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  user: User | null;
  isPremium?: boolean;
}

const UserProfile = ({ user, isPremium = true }: UserProfileProps) => {
  const navigate = useNavigate();
  
  if (!user) return null;
  
  // Get first letter of email for avatar
  const userInitial = user.email ? user.email[0].toUpperCase() : "U";
  
  return (
    <div className="relative">
      <Card className="shadow-md bg-white">
        <CardContent className="p-4 flex items-center space-x-3 relative">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-medium text-lg">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <div className="flex items-center space-x-1 mt-1">
              {isPremium ? (
                <>
                  <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 px-2 py-0">
                    <Star className="h-3 w-3 mr-1" fill="white" />
                    <span className="text-xs">Premium</span>
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-0">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    <span className="text-xs">Secure</span>
                  </Badge>
                </>
              ) : (
                <button 
                  onClick={() => navigate('/premium')}
                  className="text-xs text-gray-500 hover:text-red-800 underline"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;

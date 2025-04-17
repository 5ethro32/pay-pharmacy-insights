
import React from 'react';
import { User } from "@supabase/supabase-js";
import { 
  Star,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  user: User | null;
  isPremium?: boolean;
}

const UserProfile = ({ user, isPremium = true }: UserProfileProps) => {
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const userInitial = user.email ? user.email[0].toUpperCase() : "U";
  
  return (
    <div className="relative">
      <Card className="shadow-md bg-white">
        <CardContent className="p-4 flex items-center space-x-3 relative">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-medium text-lg">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium truncate">{user.email}</p>
              {!isPremium && (
                <button 
                  onClick={() => navigate('/premium')}
                  className="text-xs text-gray-500 hover:text-red-800 underline ml-2"
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



import { useState } from "react";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  PoundSterling 
} from "lucide-react";

interface NotificationsPopoverProps {
  hasNotifications: boolean;
  setHasNotifications: (value: boolean) => void;
}

const NotificationsPopover = ({ 
  hasNotifications, 
  setHasNotifications 
}: NotificationsPopoverProps) => {
  
  // Clear the notification indicator when opening the popover
  const handlePopoverOpen = () => {
    if (hasNotifications) {
      setHasNotifications(false);
    }
  };

  return (
    <Popover onOpenChange={handlePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full"></span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96" align="end">
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 py-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Unusual account activity detected</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Your payment has increased by 5% this month</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">New feature: Item breakdown analytics now available</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <PoundSterling className="h-4 w-4 text-red-800 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Monthly payment summary is ready for review</p>
                  <p className="text-xs text-muted-foreground">5 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="text-sm">
              View All Notifications
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;

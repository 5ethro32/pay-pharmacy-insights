import { useState, useEffect } from "react";
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
  TrendingDown, 
  FileText,
  PoundSterling 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  time: string;
  icon: JSX.Element;
}

interface NotificationsPopoverProps {
  hasNotifications: boolean;
  setHasNotifications: (value: boolean) => void;
}

const NotificationsPopover = ({ 
  hasNotifications, 
  setHasNotifications 
}: NotificationsPopoverProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        
        // Fetch the user's pharmacy schedules
        const { data: schedules } = await supabase
          .from('pharmacy_schedules')
          .select('*')
          .eq('user_id', session.user.id)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(2);
        
        if (schedules && schedules.length > 0) {
          const userNotifications: Notification[] = [];
          const currentSchedule = schedules[0];
          
          // Only compare if we have at least 2 months of data
          if (schedules.length > 1) {
            const previousSchedule = schedules[1];
            
            // Payment change notification
            const paymentDiff = currentSchedule.net_payment - previousSchedule.net_payment;
            const percentChange = (paymentDiff / previousSchedule.net_payment) * 100;
            
            if (Math.abs(percentChange) > 3) {
              userNotifications.push({
                id: 'payment-change',
                type: percentChange > 0 ? 'success' : 'alert',
                title: `Your payment has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% this month`,
                time: '1 day ago',
                icon: percentChange > 0 ? 
                  <TrendingUp className="h-4 w-4 text-green-500 shrink-0" /> : 
                  <TrendingDown className="h-4 w-4 text-rose-500 shrink-0" />
              });
            }
          }
          
          // Monthly summary notification
          userNotifications.push({
            id: 'monthly-summary',
            type: 'info',
            title: `${currentSchedule.month} ${currentSchedule.year} payment summary is ready`,
            time: '3 days ago',
            icon: <FileText className="h-4 w-4 text-blue-500 shrink-0" />
          });
          
          // If there's a large number of items, add a notification
          if (currentSchedule.total_items > 3000) {
            userNotifications.push({
              id: 'high-volume',
              type: 'warning',
              title: `High dispensing volume detected: ${currentSchedule.total_items} items`,
              time: '2 hours ago',
              icon: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
            });
          }
          
          // Add a notification about payment date
          userNotifications.push({
            id: 'payment-date',
            type: 'info',
            title: `Payment for ${currentSchedule.month} will be processed on the 30th`,
            time: '5 days ago',
            icon: <PoundSterling className="h-4 w-4 text-red-800 shrink-0" />
          });
          
          setNotifications(userNotifications);
        } else {
          // Fallback to default notifications if no schedules found
          setNotifications([
            {
              id: 'welcome',
              type: 'info',
              title: 'Welcome to Scriptly',
              time: 'Just now',
              icon: <Bell className="h-4 w-4 text-blue-500 shrink-0" />
            },
            {
              id: 'upload',
              type: 'info',
              title: 'Upload your first payment schedule to see insights',
              time: '1 minute ago',
              icon: <FileText className="h-4 w-4 text-blue-500 shrink-0" />
            }
          ]);
        }
      } catch (error: any) {
        console.error('Error fetching notification data:', error);
        // Set default notifications in case of error
        setNotifications([
          {
            id: 'system',
            type: 'alert',
            title: 'System update in progress',
            time: '2 hours ago',
            icon: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
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
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-800 border-t-transparent"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map(notification => (
                  <div key={notification.id} className="flex items-center gap-3">
                    {notification.icon}
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Removed the "View All Notifications" link */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;

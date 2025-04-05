
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PharmacyDashboard from "@/components/PharmacyDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DashboardSkeleton from "@/components/pharmacy-dashboard/DashboardSkeleton";
import ErrorDisplay from "@/components/pharmacy-dashboard/ErrorDisplay";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("summary");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (loading) {
      // Short timeout for initial user loading
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
        toast({
          title: "Loading taking longer than expected",
          description: "Please refresh the page if this continues.",
          variant: "destructive",
        });
      }, 10000); // Increased from 8000 to 10000 ms for more patience
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, toast]);

  // Reset dashboard loading when tab changes
  useEffect(() => {
    // Only reset if user is authenticated
    if (user) {
      setDashboardLoading(true);
      // Auto reset loading state after 10 seconds as fallback
      const loadingFallbackTimeout = setTimeout(() => {
        setDashboardLoading(false);
      }, 10000);
      
      return () => clearTimeout(loadingFallbackTimeout);
    }
  }, [activeTab, user]);

  const handleDashboardLoaded = useCallback(() => {
    setDashboardLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-800 mb-4" />
        <p className="text-gray-600">
          {loadingTimeout ? "This is taking longer than expected..." : "Loading your dashboard..."}
        </p>
        {loadingTimeout && (
          <Button 
            variant="outline" 
            onClick={handleRetry} 
            className="mt-4"
          >
            Refresh Page
          </Button>
        )}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
            Your Pharmacy Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Profile</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {profile?.full_name || "Not provided"}</p>
                <p><span className="font-medium">Pharmacy:</span> {profile?.pharmacy_name || "Not provided"}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upload Schedule</CardTitle>
              <CardDescription>Import your latest payment schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Upload Schedule</span>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Upload your eSchedule PDF for automated data extraction and analysis
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Commonly used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">View Payment History</Button>
                <Button variant="outline" className="w-full justify-start">Compare Schedules</Button>
                <Button variant="outline" className="w-full justify-start">Export Reports</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-start mb-6">
            <TabsList className="border border-gray-200 h-12 rounded-lg bg-white shadow-sm">
              <TabsTrigger 
                value="summary" 
                className="px-6 text-base font-medium"
              >
                Your Data
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="px-6 text-base font-medium"
              >
                Schedule Details
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="px-6 text-base font-medium"
              >
                Your Profile
              </TabsTrigger>
            </TabsList>
          </div>
          
          {dashboardLoading ? (
            <DashboardSkeleton 
              view={activeTab as "summary" | "details" | "financial"} 
              timeoutOccurred={false}
              onRetry={handleRetry}
            />
          ) : (
            <>
              <TabsContent value="summary" className="mt-2">
                <PharmacyDashboard view="summary" onLoad={handleDashboardLoaded} />
              </TabsContent>
              <TabsContent value="details" className="mt-2">
                <PharmacyDashboard view="details" onLoad={handleDashboardLoaded} />
              </TabsContent>
              <TabsContent value="financial" className="mt-2">
                <PharmacyDashboard view="financial" onLoad={handleDashboardLoaded} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

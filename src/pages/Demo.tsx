
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PharmacyDashboard from "@/components/PharmacyDashboard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Lock } from "lucide-react";

const Demo = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [showLimitedAccessDialog, setShowLimitedAccessDialog] = useState(false);

  const handleTabChange = (value: string) => {
    // Always change the tab to show the blurred content behind the dialog
    setActiveTab(value);
    
    // Show the limited access dialog for restricted tabs
    if (value === "financial" || value === "details") {
      setShowLimitedAccessDialog(true);
    }
  };

  const handleSignUpPrompt = () => {
    alert("Sign up to access full dashboard features!");
    setShowLimitedAccessDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
            EPS Dashboard Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience how pharmacy electronic payment schedules are visualized in our platform
          </p>
        </div>
        
        <Tabs defaultValue="summary" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-start mb-6">
            <TabsList className="border border-gray-200 h-12 rounded-lg bg-white shadow-sm">
              <TabsTrigger 
                value="summary" 
                className="px-6 text-base font-medium"
              >
                Payment Summary
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
                Financial Summary
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="summary" className="mt-2">
            <PharmacyDashboard view="summary" />
          </TabsContent>
          <TabsContent value="details" className="mt-2 relative">
            <div className={showLimitedAccessDialog ? "filter blur-sm pointer-events-none" : ""}>
              <PharmacyDashboard view="details" />
            </div>
          </TabsContent>
          <TabsContent value="financial" className="mt-2 relative">
            <div className={showLimitedAccessDialog ? "filter blur-sm pointer-events-none" : ""}>
              <PharmacyDashboard view="financial" />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      
      <AlertDialog open={showLimitedAccessDialog} onOpenChange={setShowLimitedAccessDialog}>
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center flex items-center justify-center flex-col">
              <Lock className="h-10 w-10 text-red-600 mb-2" />
              <span className="text-2xl font-bold text-red-800">Access Limited</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              Sign up to access detailed payment breakdowns and financial analytics
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
              <h4 className="text-red-800 font-medium mb-2">Premium Features Include:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Detailed financial breakdowns and payment analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Category M price adjustment impact analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Service diversification opportunity insights</span>
                </li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction 
              onClick={handleSignUpPrompt}
              className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white"
            >
              Sign Up for Full Access
            </AlertDialogAction>
            <AlertDialogCancel className="mt-2 sm:mt-0">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Demo;

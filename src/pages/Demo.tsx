
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PharmacyDashboard from "@/components/PharmacyDashboard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Lock, BarChart3, FileText, AlertTriangle } from "lucide-react";
import DemoUploader from "@/components/DemoUploader";
import InsightsPanel from "@/components/InsightsPanel";

const demoInsights = [
  {
    title: "Category M Adjustment Impact",
    description: "Your pharmacy is likely to see a 4.2% increase in Category M payments next quarter based on historical trends and recent DHSC announcements.",
    type: "positive"
  },
  {
    title: "Service Diversification Opportunity",
    description: "Compared to similar pharmacies in your area, you have potential to increase Advanced Service revenue by approximately £1,240 per month.",
    type: "info"
  },
  {
    title: "Payment Pattern Analysis",
    description: "Monthly net payment shows consistent growth of 3-4% over the last quarter, outperforming regional average of 1.8%.",
    type: "positive"
  }
];

const Demo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLimitedAccessDialog, setShowLimitedAccessDialog] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const handleTabChange = (value: string) => {
    // Always change the tab to show the blurred content behind the dialog
    setActiveTab(value);
    
    // Show the limited access dialog for restricted tabs
    if (value === "financial" || value === "details") {
      setShowLimitedAccessDialog(true);
    }
  };

  const handleSignUpPrompt = () => {
    window.location.href = "/auth";
  };

  const handleFileUploaded = () => {
    setHasUploadedFile(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2 animate-fade-in">
            Try Our Dashboard Demo
          </h1>
          <p className="text-lg text-gray-600 animate-fade-in">
            Experience how pharmacy electronic payment schedules are visualized in our platform
          </p>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-start mb-6">
            <TabsList className="border border-gray-200 h-12 rounded-lg bg-white shadow-sm">
              <TabsTrigger 
                value="dashboard" 
                className="px-6 text-base font-medium"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard Preview
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="px-6 text-base font-medium"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Your File
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="px-6 text-base font-medium"
              >
                <FileText className="mr-2 h-4 w-4" />
                Detailed Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="px-6 text-base font-medium"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Payment Variances
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                  <CardTitle className="text-xl">Payment Summary</CardTitle>
                  <CardDescription className="text-gray-100">
                    January 2024 EPS Payment Schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <PharmacyDashboard view="summary" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                  <CardTitle className="text-xl">AI Insights</CardTitle>
                  <CardDescription className="text-gray-100">
                    Smart analysis of your payment data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <InsightsPanel insights={demoInsights} />
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-amber-800 mb-3">Want to see more insights and details?</h3>
              <p className="text-amber-700 mb-4">
                Upload your own EPS payment file to get personalized insights, or sign up for a full account to access all features.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2">
                <Button
                  onClick={() => setActiveTab("upload")}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload My Schedule
                </Button>
                <Button
                  onClick={handleSignUpPrompt}
                  className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                >
                  Create Free Account
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="mt-2">
            {!hasUploadedFile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your EPS Payment Schedule</CardTitle>
                  <CardDescription>
                    Upload your Excel file to see a personalized analysis of your pharmacy payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DemoUploader onFileUploaded={handleFileUploaded} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-medium">
                    File uploaded successfully! Here's a preview of your data.
                  </p>
                </div>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                    <CardTitle className="text-xl">Your Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <PharmacyDashboard view="summary" />
                  </CardContent>
                </Card>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">Unlock Full Analysis</h3>
                  <p className="text-amber-700 mb-4">
                    Sign up for a free account to unlock complete payment breakdowns, financial analytics, and AI-powered insights.
                  </p>
                  <Button
                    onClick={handleSignUpPrompt}
                    className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                  >
                    Create Free Account
                  </Button>
                </div>
              </div>
            )}
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
              <span className="text-2xl font-bold text-red-800">Premium Feature</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              Sign up for a free account to access detailed payment breakdowns and financial analytics
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
              <h4 className="text-red-800 font-medium mb-2">Free Account Features Include:</h4>
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
                  <span>AI-powered payment variance detection</span>
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
              Create Free Account
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

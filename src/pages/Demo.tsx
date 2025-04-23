import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PharmacyDashboard from "@/components/PharmacyDashboard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Lock, BarChart3, FileText, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import DemoUploader from "@/components/DemoUploader";
import InsightsPanel from "@/components/InsightsPanel";
import KeyMetricsSummary from "@/components/KeyMetricsSummary";
import { MetricKey } from "@/constants/chartMetrics";
import FileUploader from "@/components/FileUploader";

const demoPaymentData = {
  id: "demo-payment-1",
  totalItems: 9868,
  netPayment: 126774,
  month: "January",
  year: 2024,
  financials: {
    grossIngredientCost: 101708,
    supplementaryPayments: 25556,
    totalDeductions: 28322
  },
  pfsDetails: {
    treatmentItems: 327,
    consultations: 42,
    referrals: 18,
    weightedActivityTotal: 414,
    basePayment: 1000.00,
    activityPayment: 1400.06,
    totalPayment: 2400.06
  }
};

const previousDemoData = {
  id: "demo-payment-2",
  totalItems: 9756,
  netPayment: 122500,
  month: "December",
  year: 2023,
  financials: {
    grossIngredientCost: 100420,
    supplementaryPayments: 24850,
    totalDeductions: 27640
  },
  pfsDetails: {
    treatmentItems: 312,
    consultations: 38,
    referrals: 16,
    weightedActivityTotal: 390,
    basePayment: 1000.00,
    activityPayment: 1320.54,
    totalPayment: 2320.54
  }
};

const demoInsights = [
  {
    title: "Category M Adjustment Impact",
    description: "Your pharmacy is likely to see a 4.2% increase in Category M payments next quarter based on historical trends and recent DHSC announcements.",
    type: "positive" as const
  },
  {
    title: "Service Diversification Opportunity",
    description: "Compared to similar pharmacies in your area, you have potential to increase Advanced Service revenue by approximately £1,240 per month.",
    type: "info" as const
  },
  {
    title: "Payment Pattern Analysis",
    description: "Monthly net payment shows consistent growth of 3-4% over the last quarter, outperforming regional average of 1.8%.",
    type: "positive" as const
  },
  {
    title: "Prescribing Trend Alert",
    description: "Increasing proportion of high-cost items detected. Consider reviewing your item mix strategy.",
    type: "warning" as const
  }
];

const Demo = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLimitedAccessDialog, setShowLimitedAccessDialog] = useState(false);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("netPayment");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
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

  const handleMetricClick = (metric: MetricKey) => {
    setSelectedMetric(metric);
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
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Payment Dashboard</h2>
                <p className="text-gray-600">January 2024 EPS Payment Schedule</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-red-50 border border-red-100 rounded-md p-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-700" />
                  <div>
                    <p className="text-xs text-gray-600">Next Payment Date</p>
                    <p className="font-medium text-red-800">April 30, 2025</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-md p-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-medium text-green-700">Up to date</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6">
              <KeyMetricsSummary 
                currentData={demoPaymentData} 
                previousData={previousDemoData} 
                onMetricClick={handleMetricClick}
                documents={[demoPaymentData, previousDemoData]}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                  <CardTitle className="text-xl">Payment Breakdown</CardTitle>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-900/90 to-red-700 text-white">
                  <CardTitle className="text-xl">Upload Your Payment Schedule</CardTitle>
                  <CardDescription className="text-gray-100">
                    Upload your Excel file to see a personalized analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <FileUploader 
                    onUpload={(file) => handleFileUploaded()}
                  />
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Why Upload Your Schedule?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <BarChart3 className="h-5 w-5 text-red-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Personalized Dashboard</h3>
                          <p className="text-gray-600">See your actual pharmacy data visualized clearly</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <TrendingUp className="h-5 w-5 text-red-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">AI-Powered Insights</h3>
                          <p className="text-gray-600">Get smart recommendations based on your specific situation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <AlertTriangle className="h-5 w-5 text-red-700" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Payment Variance Detection</h3>
                          <p className="text-gray-600">Automatically identify discrepancies in your payments</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Your data is secure:</span> All uploads are encrypted and never shared with third parties. Our demo analyzes your file locally and doesn't store any sensitive information.
                  </p>
                </div>
              </div>
            </div>
            
            {hasUploadedFile && (
              <div className="mt-8 space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-medium">
                    File uploaded successfully! Here's a preview of your data.
                  </p>
                </div>
                
                <KeyMetricsSummary 
                  currentData={demoPaymentData} 
                  previousData={previousDemoData}
                  onMetricClick={handleMetricClick}
                  documents={[demoPaymentData, previousDemoData]}
                />
                
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

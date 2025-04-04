
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PharmacyDashboard from "@/components/PharmacyDashboard";

const Demo = () => {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
            eSchedule Dashboard Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience how pharmacy payment schedules are visualized in our platform
          </p>
        </div>
        
        <Tabs defaultValue="summary" onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto mb-6 grid grid-cols-2 md:flex md:flex-row">
            <TabsTrigger value="summary" className="text-sm md:text-base">
              Payment Summary
            </TabsTrigger>
            <TabsTrigger value="details" className="text-sm md:text-base">
              Schedule Details
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-2">
            <PharmacyDashboard view="summary" />
          </TabsContent>
          <TabsContent value="details" className="mt-2">
            <PharmacyDashboard view="details" />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Demo;

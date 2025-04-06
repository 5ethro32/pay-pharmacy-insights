
import React from 'react'; 
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MonthComparisonPage from "./pages/MonthComparisonPage";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/Navbar";

// Create QueryClient outside of the component to avoid re-creation on renders
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={false}>
            {/* Navbar included here to ensure it's available on all routes */}
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard and comparison routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/comparison/month" element={<MonthComparisonPage />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;

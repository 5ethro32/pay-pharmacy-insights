
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MonthComparisonPage from "./pages/MonthComparisonPage";
import PeerComparisonPage from "./pages/PeerComparisonPage";
import PremiumPage from "./pages/PremiumPage";
import InsightsPage from "./pages/InsightsPage";
import GroupComparisonPage from "./pages/GroupComparisonPage";
import ChatWidget from "./components/chat/ChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="w-full overflow-x-hidden">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ChatProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/comparison/month" element={<MonthComparisonPage />} />
                  <Route path="/comparison/peer" element={<PeerComparisonPage />} />
                  <Route path="/comparison/group" element={<GroupComparisonPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/premium" element={<PremiumPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ChatWidget />
              </ChatProvider>
            </BrowserRouter>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;

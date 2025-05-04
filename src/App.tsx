
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import PremiumPage from "@/pages/PremiumPage";
import InsightsPage from "@/pages/InsightsPage";
import MonthComparisonPage from "@/pages/MonthComparisonPage";
import PeerComparisonPage from "@/pages/PeerComparisonPage";
import GroupComparisonPage from "@/pages/GroupComparisonPage";
import Demo from "@/pages/Demo";

import "@/App.css";

function App() {
  useEffect(() => {
    // Check if dark mode preference is saved in localStorage
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/month-comparison" element={<MonthComparisonPage />} />
          <Route path="/peer-comparison" element={<PeerComparisonPage />} />
          <Route path="/group-comparison" element={<GroupComparisonPage />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ChatProvider>
  );
}

export default App;

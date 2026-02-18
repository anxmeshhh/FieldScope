import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import IndustryExplorer from "./pages/IndustryExplorer";
import IndustryDetail from "./pages/IndustryDetail";
import Assessment from "./pages/Assessment";
import Recommendations from "./pages/Recommendations";
import Roadmap from "./pages/Roadmap";
import AIChat from "./pages/AIChat";
import MarketIntelligence from "./pages/MarketIntelligence";
import RiskRadar from "./pages/RiskRadar";
import CompetitorComparison from "./pages/CompetitorComparison";
import SuccessLibrary from "./pages/SuccessLibrary";
import VendorMatching from "./pages/VendorMatching";
import PeerBenchmarking from "./pages/PeerBenchmarking";
import FinancialPlanning from "./pages/FinancialPlanning";
import TeamAssessment from "./pages/TeamAssessment";
import NotFound from "./pages/NotFound";

export interface User {
  id: number;
  name: string;
  email: string;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={() => {}} />} />
          <Route path="/signup" element={<Signup onLogin={() => {}} />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<IndustryExplorer />} />
            <Route path="/explore/:slug" element={<IndustryDetail />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/market" element={<MarketIntelligence />} />
            <Route path="/risk" element={<RiskRadar />} />
            <Route path="/compare" element={<CompetitorComparison />} />
            <Route path="/success-library" element={<SuccessLibrary />} />
            <Route path="/vendors" element={<VendorMatching />} />
            <Route path="/benchmarking" element={<PeerBenchmarking />} />
            <Route path="/financial" element={<FinancialPlanning />} />
            <Route path="/team" element={<TeamAssessment />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
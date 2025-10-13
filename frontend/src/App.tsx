import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import ForkEditor from "./pages/ForkEditor";
import LineageTree from "./pages/LineageTree";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { RadialView, SpiralView, TimelineView } from "./pages/forklore";
import { useKeyboardNavigation } from "./hooks/use-keyboard-navigation";

const queryClient = new QueryClient();

const AppContent = () => {
  useKeyboardNavigation();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/fork/:id" element={<ForkEditor />} />
      <Route path="/forklore" element={<LineageTree />} />
      <Route path="/forklore/radial" element={<RadialView />} />
      <Route path="/forklore/spiral" element={<SpiralView />} />
      <Route path="/forklore/timeline" element={<TimelineView />} />
      {/* Legacy redirect */}
      <Route path="/lineage" element={<LineageTree />} />
      <Route path="/lineage-tree" element={<LineageTree />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/about" element={<About />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

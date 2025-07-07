
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/MainLayout";
import PostPage from "./pages/PostPage";
import { ThemeProvider } from "./components/ThemeProvider";
import SpacingGuide from "./pages/SpacingGuide";
import Tools from "./pages/Tools";
import About from "./pages/About";
import Search from "./pages/Search";
import AuthorPage from "./pages/AuthorPage";
import Learn from "./pages/Learn";
import Cases from "./pages/Cases";
import CasePage from "./pages/CasePage";
import Codex from "./pages/Codex";
import Signal from "./pages/Signal";
import LevelUp from "./pages/LevelUp";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/codex" element={<Codex />} />
                <Route path="/signal" element={<Signal />} />
                <Route path="/level-up" element={<LevelUp />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/about" element={<About />} />
                <Route path="/posts/:slug" element={<PostPage />} />
                <Route path="/cases/:slug" element={<CasePage />} />
                <Route path="/authors/:slug" element={<AuthorPage />} />
                <Route path="/spacing-guide" element={<SpacingGuide />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

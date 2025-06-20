
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Sections from "./pages/Sections";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Classrooms from "./pages/Classrooms";
import Groups from "./pages/Groups";
import Assignments from "./pages/Assignments";
import Rules from "./pages/Rules";
import Generate from "./pages/Generate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sections" element={<Layout><Sections /></Layout>} />
          <Route path="/teachers" element={<Layout><Teachers /></Layout>} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/classrooms" element={<Layout><Classrooms /></Layout>} />
          <Route path="/groups" element={<Layout><Groups /></Layout>} />
          <Route path="/assignments" element={<Layout><Assignments /></Layout>} />
          <Route path="/rules" element={<Layout><Rules /></Layout>} />
          <Route path="/generate" element={<Layout><Generate /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

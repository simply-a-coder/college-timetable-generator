
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Sections from "./pages/Sections";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Classrooms from "./pages/Classrooms";
import Groups from "./pages/Groups";
import Assignments from "./pages/Assignments";
import Rules from "./pages/Rules";
import Generate from "./pages/Generate";
import NotFound from "./pages/NotFound";

// Create QueryClient outside of component to prevent recreation on each render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/sections" element={
                <ProtectedRoute>
                  <Layout><Sections /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/teachers" element={
                <ProtectedRoute>
                  <Layout><Teachers /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/courses" element={
                <ProtectedRoute>
                  <Layout><Courses /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/classrooms" element={
                <ProtectedRoute>
                  <Layout><Classrooms /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/groups" element={
                <ProtectedRoute>
                  <Layout><Groups /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/assignments" element={
                <ProtectedRoute>
                  <Layout><Assignments /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/rules" element={
                <ProtectedRoute>
                  <Layout><Rules /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/generate" element={
                <ProtectedRoute>
                  <Layout><Generate /></Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { TaskList } from "./pages/tasks/TaskList";
import { TaskDetails } from "./pages/tasks/TaskDetails";
import { UserList } from "./pages/users/UserList";
import { useState } from "react";

const queryClient = new QueryClient();

import { getCurrentUser } from "@/lib/api";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem('token'));

  // Optional: Listen for login/logout in other tabs
  // useEffect(() => {
  //   const handler = () => setIsAuthenticated(!!sessionStorage.getItem('token'));
  //   window.addEventListener('storage', handler);
  //   return () => window.removeEventListener('storage', handler);
  // }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Dashboard onLogout={() => setIsAuthenticated(false)} />
                ) : (
                  <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  <Dashboard onLogout={() => setIsAuthenticated(false)} />
                ) : (
                  <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
                )
              } 
            />
            <Route 
              path="/dashboard/tasks" 
              element={
                isAuthenticated ? (
                  <TaskList />
                ) : (
                  <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
                )
              } 
            />
            <Route 
              path="/dashboard/tasks/:id" 
              element={
                isAuthenticated ? (
                  <TaskDetails />
                ) : (
                  <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
                )
              } 
            />
            <Route 
              path="/dashboard/users" 
              element={
                isAuthenticated ? (
                  <UserList />
                ) : (
                  <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
                )
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CRMProvider } from "./context/CRMContext";
import { AuthProvider, RequireAuth, RequireNoAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CRMProvider>
            <Toaster />
            <Sonner position="top-right" closeButton />
            
            <ClerkLoading>
              <div className="h-screen w-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </ClerkLoading>
            
            <ClerkLoaded>
              <Routes>
                {/* Public routes */}
                <Route path="/sign-in" element={
                  <RequireNoAuth>
                    <SignIn />
                  </RequireNoAuth>
                } />
                <Route path="/sign-up" element={
                  <RequireNoAuth>
                    <SignUp />
                  </RequireNoAuth>
                } />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <RequireAuth>
                    <Index />
                  </RequireAuth>
                } />
                
                {/* Redirect to sign-in if not authenticated */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ClerkLoaded>
          </CRMProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

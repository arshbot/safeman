
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CRMProvider } from "./context/CRMContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { Spinner } from "./components/ui/spinner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClerkLoading>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <AuthProvider>
          <CRMProvider>
            <div className="flex flex-col min-h-screen">
              <Toaster />
              <Sonner position="top-right" closeButton />
              <BrowserRouter>
                <Routes>
                  <Route path="/login/*" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Index />} />
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </BrowserRouter>
            </div>
          </CRMProvider>
        </AuthProvider>
      </ClerkLoaded>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "./ui/loading-state";
import { useEffect } from "react";
import { useToast } from "./ui/use-toast";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
      });
    }
  }, [loading, user, toast]);

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!user) {
    console.log("User not authenticated, redirecting to login");
    // Redirect to login but preserve the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log("User authenticated, rendering protected content");
  return <Outlet />;
};

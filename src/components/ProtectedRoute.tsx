
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "./ui/loading-state";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};


import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  const { user, loading } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="font-bold">SAFE</span>MAN
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-bold">SAFE</span> Allocation & Financing Equity <span className="font-bold">Man</span>ager
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Sign in to your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your SAFEMAN dashboard to manage your rounds and VCs
            </p>
          </div>
          
          <SignIn />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

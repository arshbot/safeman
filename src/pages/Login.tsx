
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { SignIn, useClerk } from "@clerk/clerk-react";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();
  const { openSignIn } = useClerk();

  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await openSignIn({
        redirectUrl: '/',
        appearance: {
          elements: {
            footer: "hidden",
            dividerText: "hidden"
          }
        }
      });
    } catch (error) {
      console.error("Error with Google sign-in:", error);
    }
  };

  return (
    <div className="flex items-center justify-center flex-grow py-12 bg-secondary/30">
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
          
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              Authentication error. Please try again.
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>
            
            <SignIn path="/login" signUpUrl="/sign-up" routing="path" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

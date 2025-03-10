
import React, { createContext, useContext } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: any;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    // This function is kept for API compatibility with existing code
    // but we're now using Clerk's SignIn component directly
    toast({
      title: "Using Clerk Authentication",
      description: "Please use the Clerk sign-in widget",
    });
    return Promise.resolve();
  };

  const logout = async () => {
    try {
      await signOut();
      toast({
        title: "Successfully signed out",
        description: "You have been signed out of SAFEMAN.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Failed to sign out",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading: !isLoaded, 
        signInWithGoogle, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

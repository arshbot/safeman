
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
  const { signOut, openSignIn } = useClerk();
  const { toast } = useToast();

  const signInWithGoogle = async () => {
    try {
      // Open Clerk sign-in modal with Google as the selected provider
      await openSignIn({
        redirectUrl: '/',
        appearance: {
          elements: {
            footer: "hidden",
            dividerText: "hidden"
          }
        },
        initialFirstFactor: "oauth_google"
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign-in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    }
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

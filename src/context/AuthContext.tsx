
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";
import { AuthUser } from "./types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up session listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        
        // If we have a user, enhance it with display properties
        if (session?.user) {
          const enhancedUser: AuthUser = {
            ...session.user,
            displayName: session.user.email?.split('@')[0] || null,
            photoURL: null,
          };
          setUser(enhancedUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);

        // Store user ID in localStorage for storage key
        if (session?.user?.id) {
          localStorage.setItem('clerk-user-id', session.user.id);
        } else {
          localStorage.removeItem('clerk-user-id');
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session?.user) {
        const enhancedUser: AuthUser = {
          ...data.session.user,
          displayName: data.session.user.email?.split('@')[0] || null,
          photoURL: null,
        };
        setUser(enhancedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
      
      if (data.session?.user?.id) {
        localStorage.setItem('clerk-user-id', data.session.user.id);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login'
        }
      });

      if (error) {
        console.error("Error signing in with Google:", error);
        toast({
          title: "Sign-in failed",
          description: error.message || "There was a problem signing in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign-in failed",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in with email:", error);
        toast({
          title: "Sign-in failed",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Sign-in successful",
        description: "You have been signed in to SAFEMAN.",
      });
    } catch (error: any) {
      console.error("Error signing in with email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Error signing up with email:", error);
        toast({
          title: "Sign-up failed",
          description: error.message || "There was a problem creating your account. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Account created",
        description: "Your account has been created. Please check your email for verification link.",
      });
    } catch (error: any) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Failed to sign out",
          description: error.message || "There was a problem signing out.",
          variant: "destructive",
        });
        return;
      }
      
      localStorage.removeItem('clerk-user-id');
      
      toast({
        title: "Successfully signed out",
        description: "You have been signed out of SAFEMAN.",
      });
    } catch (error: any) {
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
        loading, 
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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

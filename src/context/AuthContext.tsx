
import React, { createContext, useContext, ReactNode } from 'react';
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isSignedIn: boolean;
  userId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const value = {
    isSignedIn: !!isSignedIn,
    userId: user?.id || null,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components for conditional rendering based on auth state
export const RequireAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  );
};

export const RequireNoAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SignedOut>
      {children}
    </SignedOut>
  );
};


import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const UserMenu = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <UserButton afterSignOutUrl="/sign-in" />
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
};

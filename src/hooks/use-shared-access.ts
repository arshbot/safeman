
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface SharedAccess {
  id: string;
  shared_with_email: string;
  can_edit: boolean;
  created_at: string;
  is_active: boolean;
}

export function useSharedAccess() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sharedAccess, setSharedAccess] = useState<SharedAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load shared access data
  const loadSharedAccess = async () => {
    if (!user) {
      setError("You must be logged in to manage access");
      setIsLoading(false);
      setSharedAccess([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error loading shared access:", error);
        throw error;
      }
      
      setSharedAccess(data || []);
    } catch (error: any) {
      console.error("Error loading shared access:", error);
      setError(error.message || "Failed to load shared access data");
      toast({
        title: "Failed to load shared access",
        description: "There was a problem loading your shared access data. Please try signing out and back in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle edit permissions
  const toggleEditPermission = async (id: string, currentValue: boolean) => {
    if (!user) return;
    
    setActiveShareId(id);
    try {
      const { error } = await supabase
        .from('shared_access')
        .update({ can_edit: !currentValue })
        .eq('id', id)
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setSharedAccess(prev => 
        prev.map(share => 
          share.id === id ? { ...share, can_edit: !currentValue } : share
        )
      );
      
      toast({
        title: "Permissions updated",
        description: `User now has ${!currentValue ? "edit" : "view-only"} access.`,
      });
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Failed to update permissions",
        description: error.message || "There was a problem updating the permissions.",
        variant: "destructive",
      });
    } finally {
      setActiveShareId(null);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (id: string, currentValue: boolean) => {
    if (!user) return;
    
    setActiveShareId(id);
    try {
      const { error } = await supabase
        .from('shared_access')
        .update({ is_active: !currentValue })
        .eq('id', id)
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setSharedAccess(prev => 
        prev.map(share => 
          share.id === id ? { ...share, is_active: !currentValue } : share
        )
      );
      
      toast({
        title: "Access status updated",
        description: `Access for this user is now ${!currentValue ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      console.error("Error updating active status:", error);
      toast({
        title: "Failed to update access",
        description: error.message || "There was a problem updating the access status.",
        variant: "destructive",
      });
    } finally {
      setActiveShareId(null);
    }
  };

  // Delete shared access
  const deleteAccess = async (id: string) => {
    if (!user) return;
    
    setActiveShareId(id);
    try {
      const { error } = await supabase
        .from('shared_access')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setSharedAccess(prev => prev.filter(share => share.id !== id));
      
      toast({
        title: "Access removed",
        description: "The user's access has been completely removed.",
      });
    } catch (error: any) {
      console.error("Error deleting access:", error);
      toast({
        title: "Failed to remove access",
        description: error.message || "There was a problem removing the access.",
        variant: "destructive",
      });
    } finally {
      setActiveShareId(null);
    }
  };

  useEffect(() => {
    if (user) {
      loadSharedAccess();
    } else {
      setSharedAccess([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    sharedAccess,
    isLoading,
    activeShareId,
    error,
    loadSharedAccess,
    toggleEditPermission,
    toggleActiveStatus,
    deleteAccess
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

export const useSharedAccess = (user: User | null) => {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [sharedOwnerId, setSharedOwnerId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkSharedAccess = async () => {
      if (!user) {
        setSharedOwnerId(null);
        setIsReadOnly(false);
        return;
      }
      
      try {
        // First check if the shared_access table exists and has proper RLS policies
        const { data: tableInfo, error: tableError } = await supabase
          .from('shared_access')
          .select('id')
          .limit(1);
          
        if (tableError) {
          console.error("Error checking shared_access table:", tableError);
          // Don't display error to user, just silently fall back to non-shared mode
          setSharedOwnerId(null);
          setIsReadOnly(false);
          return;
        }
        
        // Check if this user has been granted access to someone else's data
        const { data, error } = await supabase
          .from('shared_access')
          .select('owner_id, can_edit')
          .eq('shared_with_email', user.email)
          .eq('is_active', true)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking shared access:", error);
          // Don't show error to user, just fall back to non-shared mode
          setSharedOwnerId(null);
          setIsReadOnly(false);
          return;
        }
        
        if (data) {
          setSharedOwnerId(data.owner_id);
          setIsReadOnly(!data.can_edit);
          
          toast({
            title: "Shared data access",
            description: `You are viewing shared data with ${data.can_edit ? "edit" : "view-only"} permissions.`,
          });
        } else {
          setSharedOwnerId(null);
          setIsReadOnly(false);
        }
      } catch (error) {
        console.error("Error checking shared access:", error);
        setSharedOwnerId(null);
        setIsReadOnly(false);
      }
    };
    
    checkSharedAccess();
  }, [user, toast]);

  return { isReadOnly, sharedOwnerId };
};

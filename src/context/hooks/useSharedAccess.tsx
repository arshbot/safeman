
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
        // Check if this user has been granted access to someone else's data
        const { data, error } = await supabase
          .from('shared_access')
          .select('owner_id, can_edit')
          .eq('shared_with_email', user.email)
          .eq('is_active', true)
          .maybeSingle();
          
        if (error) throw error;
        
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

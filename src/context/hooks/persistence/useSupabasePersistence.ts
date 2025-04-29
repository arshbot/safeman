
import { CRMState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

/**
 * Hook utilities for saving and loading data from Supabase
 */
export function useSupabasePersistence() {
  /**
   * Save data to Supabase for authenticated users
   */
  const saveToSupabase = async (userId: string, state: CRMState): Promise<boolean> => {
    try {
      console.info("Saving data to Supabase...");
      
      // Cast the CRMState to Json type for Supabase compatibility
      const { error } = await supabase
        .from('user_crm_data')
        .upsert({
          user_id: userId,
          data: state as unknown as Json, // Type cast to Json
        }, { onConflict: 'user_id' })
        .select();
      
      if (error) {
        console.error("Error saving data to Supabase:", error);
        return false;
      } 
      
      console.info("Data saved to Supabase successfully", {
        rounds: state.rounds.length,
        vcs: Object.keys(state.vcs).length,
        unsortedVCs: state.unsortedVCs.length,
        hasNotes: state.scratchpadNotes ? true : false
      });
      
      return true;
    } catch (error) {
      console.error("Error saving data to Supabase:", error);
      return false;
    }
  };

  /**
   * Load data from Supabase for authenticated users
   */
  const loadFromSupabase = async (userId: string): Promise<CRMState | null> => {
    try {
      console.info("Loading data from Supabase...");
      
      const { data, error } = await supabase
        .from('user_crm_data')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching data from Supabase:", error);
        toast({
          title: "Failed to load your data",
          description: "There was an error loading your saved data. Please try refreshing the page.",
          variant: "destructive",
        });
        return null;
      } 
      
      if (data) {
        // Type safety: cast Json to CRMState with validation
        const supabaseData = data.data as Record<string, any>;
        
        // Validate data structure
        if (supabaseData && 
            typeof supabaseData === 'object' && 
            'vcs' in supabaseData && 
            'rounds' in supabaseData &&
            'unsortedVCs' in supabaseData) {
          console.info("Valid CRM state loaded from Supabase");
          return supabaseData as CRMState;
        } else {
          console.error("Invalid data structure in Supabase:", supabaseData);
          toast({
            title: "Data format issue",
            description: "Your saved data appears to be in an invalid format.",
            variant: "destructive",
          });
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      return null;
    }
  };

  return {
    saveToSupabase,
    loadFromSupabase
  };
}

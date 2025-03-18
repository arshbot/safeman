
import { CRMState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Initial state
export const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
  scratchpadNotes: "",
};

// Load state from localStorage or Supabase
export const loadState = async (): Promise<CRMState | null> => {
  try {
    // First try to load from Supabase if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('user_crm_data')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading state from Supabase:', error);
        // If there's an error loading from Supabase, fall back to localStorage
        return loadFromLocalStorage();
      }
      
      if (data) {
        console.log('Loaded state from Supabase for user:', userId);
        // Cast data.data to CRMState with type assertion
        const stateData = data.data as unknown as CRMState;
        
        // Validate that the data has the expected structure
        if (isValidCRMState(stateData)) {
          // Ensure scratchpadNotes exists (for backward compatibility)
          if (!stateData.scratchpadNotes) {
            stateData.scratchpadNotes = "";
          }
          return stateData;
        } else {
          console.error('Invalid state data from Supabase, falling back to localStorage');
          return loadFromLocalStorage();
        }
      }
      
      // If no data in Supabase, try localStorage and then save to Supabase
      const localState = loadFromLocalStorage();
      
      // Save the local state to Supabase for future use if it's not the initial state
      if (localState && localState !== initialState) {
        saveToSupabase(session.user.id, localState);
      }
      
      return localState;
    }
    
    // If not authenticated, use localStorage
    return loadFromLocalStorage();
    
  } catch (err) {
    console.error('Error in loadState:', err);
    return loadFromLocalStorage();
  }
};

// Function to validate if data has CRMState structure
const isValidCRMState = (data: any): data is CRMState => {
  return data 
    && Array.isArray(data.rounds) 
    && typeof data.vcs === 'object' 
    && Array.isArray(data.unsortedVCs);
};

// Helper function to load from localStorage
const loadFromLocalStorage = (): CRMState | null => {
  try {
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) {
      return null;
    }
    
    const parsedState = JSON.parse(serializedState);
    
    // Ensure scratchpadNotes exists (for backward compatibility)
    if (!parsedState.scratchpadNotes) {
      parsedState.scratchpadNotes = "";
    }
    
    return parsedState;
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return null;
  }
};

// Save state to Supabase and localStorage for backup
export const saveState = async (state: CRMState): Promise<void> => {
  try {
    // Save to localStorage as backup
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    const serializedState = JSON.stringify(state);
    localStorage.setItem(storageKey, serializedState);
    
    // If authenticated, also save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await saveToSupabase(session.user.id, state);
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

// Helper function to save to Supabase
const saveToSupabase = async (userId: string, state: CRMState): Promise<void> => {
  try {
    // Convert state to a type compatible with Supabase's Json type
    const jsonData = state as unknown as Json;
    
    const { data, error: checkError } = await supabase
      .from('user_crm_data')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing data:', checkError);
      return;
    }
    
    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_crm_data')
        .update({ 
          data: jsonData,
          updated_at: new Date().toISOString() 
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating data in Supabase:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_crm_data')
        .insert({ 
          user_id: userId, 
          data: jsonData 
        });
      
      if (insertError) {
        console.error('Error inserting data to Supabase:', insertError);
      }
    }
  } catch (err) {
    console.error('Error in saveToSupabase:', err);
  }
};

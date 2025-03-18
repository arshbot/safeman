import { CRMState } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Initial state
export const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
  scratchpadNotes: "",
  isAddRoundModalOpen: false,
  isAddVcModalOpen: false,
  isEditRoundModalOpen: false,
  isEditVcModalOpen: false,
  selectedRoundId: null,
  selectedVcId: null
};

// Load state from localStorage or Supabase
export const loadState = async (sharedOwnerId: string | null = null): Promise<CRMState> => {
  try {
    // First try to load from Supabase if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // If we have a sharedOwnerId, load that user's data instead
      const userId = sharedOwnerId || session.user.id;
      
      const { data, error } = await supabase
        .from('user_crm_data')
        .select('data')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error loading state from Supabase:', error);
        // If there's an error loading from Supabase, fall back to localStorage
        // But only if we're not trying to load shared data
        if (!sharedOwnerId) {
          return loadFromLocalStorage();
        } else {
          return initialState;
        }
      }
      
      if (data) {
        console.log('Loaded state from Supabase');
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
          if (!sharedOwnerId) {
            return loadFromLocalStorage();
          } else {
            return initialState;
          }
        }
      }
      
      // If no data in Supabase, try localStorage and then save to Supabase
      // But only if we're not trying to load shared data
      if (!sharedOwnerId) {
        const localState = loadFromLocalStorage();
        
        // Save the local state to Supabase for future use
        if (localState !== initialState) {
          saveToSupabase(session.user.id, localState);
        }
        
        return localState;
      }
      
      // If we're trying to load shared data but none exists, return initial state
      return initialState;
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
const loadFromLocalStorage = (): CRMState => {
  try {
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) {
      return initialState;
    }
    
    const parsedState = JSON.parse(serializedState);
    
    // Ensure scratchpadNotes exists (for backward compatibility)
    if (!parsedState.scratchpadNotes) {
      parsedState.scratchpadNotes = "";
    }
    
    return parsedState;
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return initialState;
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
    if (userId) {
      await saveToSupabase(userId, state);
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

// Helper function to save to Supabase
const saveToSupabase = async (userId: string, state: CRMState): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('user_crm_data')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error checking for existing data:', error);
      return;
    }
    
    // Convert state to a type compatible with Supabase's Json type
    const jsonData = state as unknown as Json;
    
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

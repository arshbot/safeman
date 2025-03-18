
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
      console.log('Attempting to load state from Supabase for user:', userId);
      
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
        console.log('Successfully loaded state from Supabase');
        // Cast data.data to CRMState with type assertion
        const stateData = data.data as unknown as CRMState;
        
        // Validate that the data has the expected structure
        if (isValidCRMState(stateData)) {
          // Ensure scratchpadNotes exists (for backward compatibility)
          if (!stateData.scratchpadNotes) {
            stateData.scratchpadNotes = "";
          }
          
          // Add source information (non-persisted, just for debugging)
          return {
            ...stateData,
            _dataSource: 'Supabase'
          };
        } else {
          console.error('Invalid state data from Supabase, falling back to localStorage');
          return loadFromLocalStorage();
        }
      } else {
        console.log('No data found in Supabase, checking localStorage');
      }
      
      // If no data in Supabase, try localStorage and then save to Supabase
      const localState = loadFromLocalStorage();
      
      // Save the local state to Supabase for future use if it's not the initial state
      if (localState && JSON.stringify(localState) !== JSON.stringify(initialState)) {
        console.log('Saving localStorage data to Supabase');
        await saveToSupabase(session.user.id, localState);
      }
      
      return localState;
    }
    
    // If not authenticated, use localStorage
    console.log('User not authenticated, using localStorage');
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
    // For backward compatibility, try both keys
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    console.log('Trying to load from localStorage with key:', storageKey);
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) {
      console.log('No state found in localStorage');
      return null;
    }
    
    const parsedState = JSON.parse(serializedState);
    console.log('Successfully loaded state from localStorage');
    
    // Ensure scratchpadNotes exists (for backward compatibility)
    if (!parsedState.scratchpadNotes) {
      parsedState.scratchpadNotes = "";
    }
    
    // Add source information (non-persisted, just for debugging)
    return {
      ...parsedState,
      _dataSource: 'localStorage'
    };
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return null;
  }
};

// Save state to Supabase and localStorage for backup
export const saveState = async (state: CRMState): Promise<void> => {
  try {
    // Create a copy of the state without the _dataSource field (which is just for debugging)
    const stateToPersist = { ...state };
    // @ts-ignore - Remove non-persistent field
    delete stateToPersist._dataSource;
    
    // Save to localStorage as backup
    const serializedState = JSON.stringify(stateToPersist);
    localStorage.setItem('crmState-anonymous', serializedState);
    console.log('State saved to localStorage');
    
    // If authenticated, also save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      console.log('User authenticated, saving to Supabase');
      await saveToSupabase(session.user.id, stateToPersist);
    } else {
      console.log('User not authenticated, state only saved to localStorage');
    }
  } catch (err) {
    console.error('Error saving state:', err);
    throw err; // Re-throw to handle in the component
  }
};

// Helper function to save to Supabase
const saveToSupabase = async (userId: string, state: CRMState): Promise<void> => {
  try {
    // Convert state to a type compatible with Supabase's Json type
    const jsonData = state as unknown as Record<string, any>;
    
    // Check if we have existing data
    const { data, error: checkError } = await supabase
      .from('user_crm_data')
      .select('id, data')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing data:', checkError);
      throw checkError;
    }
    
    // Only save if data has changed
    if (data) {
      const existingData = data.data as unknown as Record<string, any>;
      const existingJSON = JSON.stringify(existingData);
      const newJSON = JSON.stringify(jsonData);
      
      if (existingJSON === newJSON) {
        console.log('Data unchanged, skipping Supabase update');
        return;
      }
      
      // Update existing record
      console.log('Updating existing record in Supabase');
      const { error: updateError } = await supabase
        .from('user_crm_data')
        .update({ 
          data: jsonData,
          updated_at: new Date().toISOString() 
        })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating data in Supabase:', updateError);
        throw updateError;
      } else {
        console.log('Successfully updated data in Supabase');
      }
    } else {
      // Insert new record
      console.log('Creating new record in Supabase');
      const { error: insertError } = await supabase
        .from('user_crm_data')
        .insert({ 
          user_id: userId, 
          data: jsonData 
        });
      
      if (insertError) {
        console.error('Error inserting data to Supabase:', insertError);
        throw insertError;
      } else {
        console.log('Successfully inserted data to Supabase');
      }
    }
  } catch (err) {
    console.error('Error in saveToSupabase:', err);
    throw err; // Re-throw to handle in the component
  }
};

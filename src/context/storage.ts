
import { CRMState } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Initial state
export const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
};

// Load state from localStorage or Supabase
export const loadState = async (): Promise<CRMState> => {
  try {
    // First try to load from Supabase if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data, error } = await supabase
        .from('user_crm_data')
        .select('data')
        .eq('user_id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error loading state from Supabase:', error);
        // If there's an error loading from Supabase, fall back to localStorage
        return loadFromLocalStorage();
      }
      
      if (data) {
        console.log('Loaded state from Supabase');
        return data.data as CRMState;
      }
      
      // If no data in Supabase, try localStorage and then save to Supabase
      const localState = loadFromLocalStorage();
      
      // Save the local state to Supabase for future use
      if (localState !== initialState) {
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

// Helper function to load from localStorage
const loadFromLocalStorage = (): CRMState => {
  try {
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
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
    
    if (data) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_crm_data')
        .update({ data: state, updated_at: new Date().toISOString() })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating data in Supabase:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_crm_data')
        .insert({ user_id: userId, data: state });
      
      if (insertError) {
        console.error('Error inserting data to Supabase:', insertError);
      }
    }
  } catch (err) {
    console.error('Error in saveToSupabase:', err);
  }
};

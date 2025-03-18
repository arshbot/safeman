
import { useEffect } from 'react';
import { CRMState } from '@/types';
import { loadState, saveState, initialState } from '../storage';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export const useDataPersistence = (
  user: User | null,
  authLoading: boolean,
  dispatch: React.Dispatch<any>,
  state: CRMState,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  // Load state once auth is ready
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading data, user state:', user ? 'logged in' : 'not logged in');
        
        // Load user's data
        const loadedState = await loadState();
        if (loadedState) {
          console.log('Data loaded successfully');
          dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
        } else {
          // Initialize with empty state if no data found
          console.log('No data found, initializing with empty state');
          dispatch({ type: 'INITIALIZE_STATE', payload: initialState });
        }
      } catch (error) {
        console.error('Error loading CRM state:', error);
        // Show error message to user
        toast({
          title: "Failed to load data",
          description: "There was a problem loading your data. Please try refreshing the page.",
          variant: "destructive",
        });
        // Initialize with empty state on error
        dispatch({ type: 'INITIALIZE_STATE', payload: initialState });
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data when auth is not loading anymore
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, dispatch, setIsLoading, toast]);

  // Save state when it changes
  useEffect(() => {
    // Simple debounce for saving state
    const saveTimeout = setTimeout(() => {
      console.log('Saving state, user:', user ? user.id : 'not logged in');
      saveState(state);
    }, 500);
    
    return () => clearTimeout(saveTimeout);
  }, [state, user]);
};

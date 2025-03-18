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
        console.log('Loading data, user state:', user ? `logged in as ${user.id}` : 'not logged in');
        
        // Load user's data
        const loadedState = await loadState();
        if (loadedState) {
          console.log('Data loaded successfully', {
            rounds: loadedState.rounds.length,
            vcs: Object.keys(loadedState.vcs).length,
            unsortedVCs: loadedState.unsortedVCs.length,
            hasNotes: Boolean(loadedState.scratchpadNotes),
            source: loadedState._dataSource || 'unknown'
          });
          dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
          
          // Show toast for successful data load
          if (user) {
            toast({
              title: "Data loaded",
              description: `Your data has been loaded from ${loadedState._dataSource || 'storage'}`,
            });
          }
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
    // Only save if the state has been initialized
    if (Object.keys(state.vcs).length === 0 && state.rounds.length === 0 && !state.scratchpadNotes) {
      return;
    }
    
    // Simple debounce for saving state
    const saveTimeout = setTimeout(async () => {
      try {
        console.log('Saving state, user:', user ? `${user.id}` : 'not logged in');
        const startTime = performance.now();
        await saveState(state);
        const duration = Math.round(performance.now() - startTime);
        console.log(`State saved successfully (${duration}ms)`);
        
        // Show toast for successful save if it took more than 100ms
        // (likely Supabase save rather than localStorage)
        if (duration > 100) {
          toast({
            title: "Changes saved",
            description: user ? "Your changes have been saved to the cloud" : "Your changes have been saved locally",
          });
        }
      } catch (error) {
        console.error('Error saving state:', error);
        toast({
          title: "Failed to save changes",
          description: "There was a problem saving your changes. Please try again.",
          variant: "destructive",
        });
      }
    }, 500);
    
    return () => clearTimeout(saveTimeout);
  }, [state, user, toast]);
};

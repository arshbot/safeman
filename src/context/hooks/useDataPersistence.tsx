
import { useEffect } from 'react';
import { CRMState } from '@/types';
import { loadState, saveState, initialState } from '../storage';
import { User } from '@supabase/supabase-js';

export const useDataPersistence = (
  user: User | null,
  authLoading: boolean,
  dispatch: React.Dispatch<any>,
  state: CRMState,
  isReadOnly: boolean,
  sharedOwnerId: string | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Load state once auth is ready
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // If user is not logged in, initialize with empty state
        if (!user) {
          dispatch({ type: 'INITIALIZE_STATE', payload: initialState });
          setIsLoading(false);
          return;
        }
        
        const loadedState = await loadState(sharedOwnerId);
        if (loadedState) {
          dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
        }
      } catch (error) {
        console.error('Error loading CRM state:', error);
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
  }, [user, sharedOwnerId, authLoading, dispatch, setIsLoading]);

  // Save state when it changes
  useEffect(() => {
    const shouldSave = !isReadOnly && !sharedOwnerId && user;
    
    if (shouldSave) {
      saveState(state);
    }
  }, [state, isReadOnly, sharedOwnerId, user]);
};

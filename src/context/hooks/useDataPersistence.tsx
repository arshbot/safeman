
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useLocalStorage } from './persistence/useLocalStorage';
import { useSupabasePersistence } from './persistence/useSupabasePersistence';
import { useRetryLogic } from './persistence/useRetryLogic';
import { useDebounceSave } from './persistence/useDebounceSave';

export function useDataPersistence(
  user: any,
  authLoading: boolean,
  dispatch: React.Dispatch<CRMAction>,
  state: CRMState,
  setIsLoading: (isLoading: boolean) => void
) {
  const stateRef = useRef(state);
  const [isSaving, setIsSaving] = useState(false);
  
  // Import persistence utilities
  const { saveToLocalStorage, loadFromLocalStorage } = useLocalStorage();
  const { saveToSupabase, loadFromSupabase } = useSupabasePersistence();
  const { retryCount, saveError, handleRetry, resetRetryState } = useRetryLogic();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Reset error state when user changes
  useEffect(() => {
    resetRetryState();
  }, [user]);

  // Function to save data
  const saveData = async (currentState: CRMState): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      if (user) {
        // Save to Supabase for authenticated users
        return await handleRetry(
          () => saveToSupabase(user.id, currentState), 
          currentState
        );
      } else {
        // Save to localStorage for anonymous users
        const success = saveToLocalStorage('crmState-anonymous', currentState);
        
        const isModalOpen = () => {
          const dialogElements = document.querySelectorAll('[role="dialog"]');
          return dialogElements.length > 0;
        };
        
        if (success && !isModalOpen()) {
          toast({
            title: "Data Saved",
            description: "Your progress has been saved locally.",
          });
        }
        
        setIsSaving(false);
        return success;
      }
    } catch (error) {
      console.error("Error in saveData:", error);
      setIsSaving(false);
      return false;
    }
  };

  // Set up debounced save
  const { debounceSave } = useDebounceSave(saveData);

  // Load data from storage
  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      try {
        console.info("Loading data, user state:", user ? "logged in" : "not logged in");
        
        let loadedState: CRMState | null = null;
        
        if (user) {
          // Load from Supabase for authenticated users
          console.info("User authenticated, using Supabase");
          loadedState = await loadFromSupabase(user.id);
          
          if (loadedState) {
            toast({
              title: "Data loaded successfully",
              description: "Your saved data has been loaded.",
            });
          }
        } else {
          // Load from localStorage for anonymous users
          console.info("User not authenticated, using localStorage");
          loadedState = loadFromLocalStorage('crmState-anonymous');
          
          if (loadedState) {
            toast({
              title: "Local data loaded",
              description: "Your local data has been loaded successfully.",
            });
          }
        }
        
        if (loadedState) {
          dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
          console.info("Data loaded successfully", {
            rounds: loadedState.rounds.length,
            vcs: Object.keys(loadedState.vcs).length,
            unsortedVCs: loadedState.unsortedVCs.length,
            hasNotes: loadedState.scratchpadNotes ? true : false,
            source: user ? "Supabase" : "localStorage"
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: "An unexpected error occurred while loading your data.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, dispatch, setIsLoading]);

  // Save data when state changes
  useEffect(() => {
    if (authLoading) return;
    debounceSave(stateRef.current);
  }, [state, user, authLoading]);

  // Return save status for UI indicators
  return {
    isSaving,
    saveError,
    retryCount,
    manualSave: () => saveData(stateRef.current),
  };
}

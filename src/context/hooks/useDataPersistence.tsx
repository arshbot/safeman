import { CRMState, VC } from '@/types';
import { CRMAction } from '../types';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useDataPersistence(
  user: any,
  authLoading: boolean,
  dispatch: React.Dispatch<CRMAction>,
  state: CRMState,
  setIsLoading: (isLoading: boolean) => void
) {
  // Keep track of whether any modals are currently open
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const stateRef = useRef(state);
  
  // Update the ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
          const { data, error } = await supabase
            .from('crm_data')
            .select('data')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching data from Supabase:", error);
          } else if (data && data.data) {
            loadedState = JSON.parse(data.data as string) as CRMState;
          }
        } else {
          // Load from localStorage for anonymous users
          console.info("User not authenticated, using localStorage");
          const storageKey = 'crmState-anonymous';
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            loadedState = JSON.parse(storedData) as CRMState;
          }
        }
        
        // If we have loaded state, initialize the app with it
        if (loadedState) {
          dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
          console.info("Data loaded successfully", {
            rounds: loadedState.rounds.length,
            vcs: Object.keys(loadedState.vcs).length,
            unsortedVCs: loadedState.unsortedVCs.length,
            hasNotes: Object.keys(loadedState.meetingNotes || {}).length > 0,
            source: user ? "Supabase" : "localStorage"
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, dispatch, setIsLoading]);

  // Save data when state changes, with enhanced debouncing and modal awareness
  useEffect(() => {
    // Skip initial render to avoid unnecessary saves
    if (authLoading) return;
    
    // Check if any dialog/modal is currently open by looking for elements
    const isModalOpen = () => {
      const dialogElements = document.querySelectorAll('[role="dialog"]');
      return dialogElements.length > 0;
    };

    // Debounce save operations to avoid too frequent saves
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = window.setTimeout(async () => {
      const currentState = stateRef.current;
      
      try {
        if (user) {
          // Save to Supabase for authenticated users
          const { data, error } = await supabase
            .from('crm_data')
            .upsert({
              user_id: user.id,
              data: JSON.stringify(currentState),
            }, { onConflict: 'user_id' })
            .select();
          
          if (error) {
            console.error("Error saving data to Supabase:", error);
          } else {
            console.info("Data saved to Supabase successfully", {
              rounds: currentState.rounds.length,
              vcs: Object.keys(currentState.vcs).length,
              unsortedVCs: currentState.unsortedVCs.length,
              hasNotes: Object.keys(currentState.meetingNotes || {}).length > 0
            });
          }
        } else {
          // Save to localStorage for anonymous users
          const storageKey = 'crmState-anonymous';
          localStorage.setItem(storageKey, JSON.stringify(currentState));
          
          // Only show toast if not in the middle of modal interactions
          // This prevents toast notifications from interfering with modals
          if (!isModalOpen()) {
            toast({
              title: "Data Saved",
              description: "Your progress has been saved locally.",
            });
          }
        }
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }, 2000); // Increased debounce time to reduce save frequency
    
    setDebounceTimer(timer as any);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [state, user, authLoading]);
}

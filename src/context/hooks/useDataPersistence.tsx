
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
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const stateRef = useRef(state);
  
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
            .from('user_crm_data')
            .select('data')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching data from Supabase:", error);
          } else if (data) {
            // Data from Supabase is already JSON, no need to parse
            loadedState = data.data as CRMState;

            // Validate data structure
            if (loadedState && 
                typeof loadedState === 'object' && 
                'vcs' in loadedState && 
                'rounds' in loadedState &&
                'unsortedVCs' in loadedState) {
              console.info("Valid CRM state loaded from Supabase");
            } else {
              console.error("Invalid data structure in Supabase:", loadedState);
              loadedState = null;
            }
          }
        } else {
          // Load from localStorage for anonymous users
          console.info("User not authenticated, using localStorage");
          const storageKey = 'crmState-anonymous';
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            try {
              loadedState = JSON.parse(storedData) as CRMState;
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
            }
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
        setIsLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, dispatch, setIsLoading]);

  // Save data when state changes
  useEffect(() => {
    if (authLoading) return;
    
    const isModalOpen = () => {
      const dialogElements = document.querySelectorAll('[role="dialog"]');
      return dialogElements.length > 0;
    };

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = window.setTimeout(async () => {
      const currentState = stateRef.current;
      
      try {
        if (user) {
          // Save to Supabase for authenticated users
          const { error } = await supabase
            .from('user_crm_data')
            .upsert({
              user_id: user.id,
              data: currentState, // No need to stringify, Supabase handles JSON
            }, { onConflict: 'user_id' })
            .select();
          
          if (error) {
            console.error("Error saving data to Supabase:", error);
          } else {
            console.info("Data saved to Supabase successfully", {
              rounds: currentState.rounds.length,
              vcs: Object.keys(currentState.vcs).length,
              unsortedVCs: currentState.unsortedVCs.length,
              hasNotes: currentState.scratchpadNotes ? true : false
            });
          }
        } else {
          // Save to localStorage for anonymous users
          const storageKey = 'crmState-anonymous';
          localStorage.setItem(storageKey, JSON.stringify(currentState));
          
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
    }, 2000);
    
    setDebounceTimer(timer as any);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [state, user, authLoading]);
}


import { CRMState, VC } from '@/types';
import { CRMAction } from '../types';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function useDataPersistence(
  user: any,
  authLoading: boolean,
  dispatch: React.Dispatch<CRMAction>,
  state: CRMState,
  setIsLoading: (isLoading: boolean) => void
) {
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const stateRef = useRef(state);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Reset error state when user changes
  useEffect(() => {
    setSaveError(null);
    setRetryCount(0);
  }, [user]);

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
            toast({
              title: "Failed to load your data",
              description: "There was an error loading your saved data. Please try refreshing the page.",
              variant: "destructive",
            });
          } else if (data) {
            // Type safety: cast Json to CRMState with validation
            const supabaseData = data.data as Record<string, any>;
            
            // Validate data structure
            if (supabaseData && 
                typeof supabaseData === 'object' && 
                'vcs' in supabaseData && 
                'rounds' in supabaseData &&
                'unsortedVCs' in supabaseData) {
              console.info("Valid CRM state loaded from Supabase");
              loadedState = supabaseData as CRMState;
              toast({
                title: "Data loaded successfully",
                description: "Your saved data has been loaded.",
              });
            } else {
              console.error("Invalid data structure in Supabase:", supabaseData);
              loadedState = null;
              toast({
                title: "Data format issue",
                description: "Your saved data appears to be in an invalid format.",
                variant: "destructive",
              });
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
              toast({
                title: "Local data loaded",
                description: "Your local data has been loaded successfully.",
              });
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
              toast({
                title: "Data format issue",
                description: "Your local data appears to be corrupted.",
                variant: "destructive",
              });
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

  // Function to save data with retry mechanism
  const saveData = async (currentState: CRMState, attempt = 0): Promise<boolean> => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      if (user) {
        // Save to Supabase for authenticated users
        console.info(`Saving data to Supabase (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
        
        // Cast the CRMState to Json type for Supabase compatibility
        const { error } = await supabase
          .from('user_crm_data')
          .upsert({
            user_id: user.id,
            data: currentState as unknown as Json, // Type cast to Json
          }, { onConflict: 'user_id' })
          .select();
        
        if (error) {
          console.error("Error saving data to Supabase:", error);
          setSaveError(`Failed to save: ${error.message}`);
          
          // If we haven't reached max retries, try again
          if (attempt < MAX_RETRIES) {
            setRetryCount(attempt + 1);
            // Exponential backoff: 1s, 2s, 4s, etc.
            const backoffTime = Math.pow(2, attempt) * 1000;
            
            console.info(`Retrying in ${backoffTime}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            return saveData(currentState, attempt + 1);
          } else {
            toast({
              title: "Failed to save your data",
              description: (
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p>Your changes could not be saved to the server after multiple attempts.</p>
                    <button 
                      onClick={() => saveData(stateRef.current, 0)}
                      className="text-primary underline mt-2"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ),
              variant: "destructive",
              duration: 10000, // longer duration for error messages
            });
            setIsSaving(false);
            return false;
          }
        } else {
          console.info("Data saved to Supabase successfully", {
            rounds: currentState.rounds.length,
            vcs: Object.keys(currentState.vcs).length,
            unsortedVCs: currentState.unsortedVCs.length,
            hasNotes: currentState.scratchpadNotes ? true : false
          });
          
          // Only show toast if we had errors before that are now resolved
          if (saveError) {
            toast({
              title: "Data saved successfully",
              description: "Your changes have been saved to the cloud.",
            });
            setSaveError(null);
            setRetryCount(0);
          }
          setIsSaving(false);
          return true;
        }
      } else {
        // Save to localStorage for anonymous users
        const storageKey = 'crmState-anonymous';
        localStorage.setItem(storageKey, JSON.stringify(currentState));
        console.info("Data saved to localStorage successfully");
        
        const isModalOpen = () => {
          const dialogElements = document.querySelectorAll('[role="dialog"]');
          return dialogElements.length > 0;
        };
        
        if (!isModalOpen()) {
          toast({
            title: "Data Saved",
            description: "Your progress has been saved locally.",
          });
        }
        setIsSaving(false);
        return true;
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "Error saving data",
        description: (
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p>An unexpected error occurred while saving your data.</p>
              <button 
                onClick={() => saveData(stateRef.current, 0)}
                className="text-primary underline mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      setIsSaving(false);
      return false;
    }
  };

  // Save data when state changes
  useEffect(() => {
    if (authLoading) return;
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = window.setTimeout(() => {
      const currentState = stateRef.current;
      saveData(currentState, 0);
    }, 2000);
    
    setDebounceTimer(timer as any);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [state, user, authLoading]);

  // Return save status for UI indicators
  return {
    isSaving,
    saveError,
    retryCount,
    manualSave: () => saveData(stateRef.current, 0),
  };
}

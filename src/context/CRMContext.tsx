
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { CRMState, Round, VC, MeetingNote } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { crmReducer } from './reducers';
import { loadState, saveState, initialState } from './storage';
import { getRoundSummary } from './crmUtils';
import { CRMContextType } from './types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Context
const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Provider
export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [sharedOwnerId, setSharedOwnerId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if the current user has access to someone else's data
  useEffect(() => {
    const checkSharedAccess = async () => {
      if (!user) return;
      
      try {
        // Check if this user has been granted access to someone else's data
        const { data, error } = await supabase
          .from('shared_access')
          .select('owner_id, can_edit')
          .eq('shared_with_email', user.email)
          .eq('is_active', true)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setSharedOwnerId(data.owner_id);
          setIsReadOnly(!data.can_edit);
          
          toast({
            title: "Shared data access",
            description: `You are viewing shared data with ${data.can_edit ? "edit" : "view-only"} permissions.`,
          });
        } else {
          setSharedOwnerId(null);
          setIsReadOnly(false);
        }
      } catch (error) {
        console.error("Error checking shared access:", error);
      }
    };
    
    checkSharedAccess();
  }, [user]);

  // Load state on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const loadedState = await loadState(sharedOwnerId);
        // Create a new action to initialize state
        if (loadedState) {
          dispatch({ type: 'INITIALIZE_STATE', payload: loadedState });
        }
      } catch (error) {
        console.error('Error loading CRM state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, sharedOwnerId]);

  // Save state when it changes
  useEffect(() => {
    if (!isLoading && !isReadOnly && !sharedOwnerId) {
      saveState(state);
    }
  }, [state, isLoading, isReadOnly, sharedOwnerId]);

  // Helper function to check if action is allowed
  const isActionAllowed = () => {
    if (isReadOnly) {
      toast({
        title: "View-only access",
        description: "You have view-only access to this data and cannot make changes.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const addRound = (round: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded' | 'visibility'>) => {
    if (!isActionAllowed()) return "";
    
    const id = uuidv4();
    dispatch({ type: 'ADD_ROUND', payload: { ...round, id } });
    return id;
  };

  const updateRound = (round: Round) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'UPDATE_ROUND', payload: round });
  };

  const deleteRound = (roundId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DELETE_ROUND', payload: roundId });
  };

  const addVC = (vc: Omit<VC, 'id'>): string => {
    if (!isActionAllowed()) return "";
    
    const id = uuidv4();
    dispatch({ type: 'ADD_VC', payload: { vc, id } });
    return id;
  };

  const updateVC = (vc: VC) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'UPDATE_VC', payload: vc });
  };

  const deleteVC = (vcId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DELETE_VC', payload: vcId });
  };

  const duplicateVC = (vcId: string, roundId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DUPLICATE_VC', payload: { vcId, roundId } });
  };

  const addVCToRound = (vcId: string, roundId: string) => {
    if (!isActionAllowed()) return;
    
    console.log(`[DEBUG] CRMContext.addVCToRound called with vcId: ${vcId}, roundId: ${roundId}`);
    console.log(`[DEBUG] Current unsortedVCs before:`, state.unsortedVCs);
    console.log(`[DEBUG] Current round VCs before:`, state.rounds.find(r => r.id === roundId)?.vcs);
    
    dispatch({ type: 'ADD_VC_TO_ROUND', payload: { vcId, roundId } });
    
    // Add a slight delay to log state after update
    setTimeout(() => {
      console.log(`[DEBUG] Current unsortedVCs after:`, state.unsortedVCs);
      console.log(`[DEBUG] Current round VCs after:`, state.rounds.find(r => r.id === roundId)?.vcs);
    }, 100);
  };

  const removeVCFromRound = (vcId: string, roundId: string) => {
    if (!isActionAllowed()) return;
    
    console.log(`[DEBUG] CRMContext.removeVCFromRound called with vcId: ${vcId}, roundId: ${roundId}`);
    console.log(`[DEBUG] Current unsortedVCs before:`, state.unsortedVCs);
    console.log(`[DEBUG] Current round VCs before:`, state.rounds.find(r => r.id === roundId)?.vcs);
    
    dispatch({ type: 'REMOVE_VC_FROM_ROUND', payload: { vcId, roundId } });
    
    // Add a slight delay to log state after update
    setTimeout(() => {
      console.log(`[DEBUG] Current unsortedVCs after:`, state.unsortedVCs);
      console.log(`[DEBUG] Current round VCs after:`, state.rounds.find(r => r.id === roundId)?.vcs);
    }, 100);
  };

  const toggleRoundExpand = (roundId: string) => {
    dispatch({ type: 'TOGGLE_ROUND_EXPAND', payload: roundId });
  };

  const cycleRoundVisibility = (roundId: string) => {
    dispatch({ type: 'CYCLE_ROUND_VISIBILITY', payload: roundId });
  };

  const reorderRounds = (rounds: Round[]) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'REORDER_ROUNDS', payload: rounds });
  };

  const reorderVCs = (roundId: string, vcIds: string[]) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'REORDER_VCS', payload: { roundId, vcIds } });
  };

  const getRoundSummaryFn = (roundId: string) => {
    return getRoundSummary(state, roundId);
  };

  const addMeetingNote = (vcId: string, content: string) => {
    if (!isActionAllowed()) return;
    
    const note: MeetingNote = {
      id: uuidv4(),
      date: new Date().toISOString(),
      content,
    };
    
    dispatch({ type: 'ADD_MEETING_NOTE', payload: { vcId, note } });
  };
  
  const updateMeetingNote = (vcId: string, note: MeetingNote) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'UPDATE_MEETING_NOTE', payload: { vcId, note } });
  };
  
  const deleteMeetingNote = (vcId: string, noteId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DELETE_MEETING_NOTE', payload: { vcId, noteId } });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading your data...</div>;
  }

  return (
    <CRMContext.Provider
      value={{
        state,
        isReadOnly,
        addRound,
        updateRound,
        deleteRound,
        addVC,
        updateVC,
        deleteVC,
        duplicateVC,
        addVCToRound,
        removeVCFromRound,
        toggleRoundExpand,
        cycleRoundVisibility,
        reorderRounds,
        reorderVCs,
        getRoundSummary: getRoundSummaryFn,
        addMeetingNote,
        updateMeetingNote,
        deleteMeetingNote,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

// Hook
export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

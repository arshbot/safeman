
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Round, VC, MeetingNote, CRMState } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export const useCrmActions = (
  dispatch: React.Dispatch<any>,
  isReadOnly: boolean,
  state: CRMState
) => {
  const { toast } = useToast();

  // Helper function to check if action is allowed
  const isActionAllowed = useCallback(() => {
    if (isReadOnly) {
      toast({
        title: "View-only access",
        description: "You have view-only access to this data and cannot make changes.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [isReadOnly, toast]);

  const addRound = useCallback((round: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded' | 'visibility'>) => {
    if (!isActionAllowed()) return "";
    
    const id = uuidv4();
    dispatch({ type: 'ADD_ROUND', payload: { ...round, id } });
    return id;
  }, [dispatch, isActionAllowed]);

  const updateRound = useCallback((round: Round) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'UPDATE_ROUND', payload: round });
  }, [dispatch, isActionAllowed]);

  const deleteRound = useCallback((roundId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DELETE_ROUND', payload: roundId });
  }, [dispatch, isActionAllowed]);

  const addVC = useCallback((vc: Omit<VC, 'id'>): string => {
    if (!isActionAllowed()) return "";
    
    const id = uuidv4();
    dispatch({ type: 'ADD_VC', payload: { vc, id } });
    return id;
  }, [dispatch, isActionAllowed]);

  const updateVC = useCallback((vc: VC) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'UPDATE_VC', payload: vc });
  }, [dispatch, isActionAllowed]);

  const deleteVC = useCallback((vcId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DELETE_VC', payload: vcId });
  }, [dispatch, isActionAllowed]);

  const duplicateVC = useCallback((vcId: string, roundId: string) => {
    if (!isActionAllowed()) return;
    
    dispatch({ type: 'DUPLICATE_VC', payload: { vcId, roundId } });
  }, [dispatch, isActionAllowed]);

  const addVCToRound = useCallback((vcId: string, roundId: string) => {
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
  }, [dispatch, isActionAllowed, state]);

  const removeVCFromRound = useCallback((vcId: string, roundId: string) => {
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
  }, [dispatch, isActionAllowed, state]);

  return {
    addRound,
    updateRound,
    deleteRound,
    addVC,
    updateVC,
    deleteVC,
    duplicateVC,
    addVCToRound,
    removeVCFromRound,
  };
};

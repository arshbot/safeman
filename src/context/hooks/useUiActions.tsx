
import { useCallback } from 'react';
import { Round } from '@/types';
import { CRMState } from '../types';

export const useUiActions = (
  dispatch: React.Dispatch<any>,
  state: CRMState,
  isReadOnly: boolean,
) => {
  const toggleRoundExpand = useCallback((roundId: string) => {
    dispatch({ type: 'TOGGLE_ROUND_EXPAND', payload: roundId });
  }, [dispatch]);

  const cycleRoundVisibility = useCallback((roundId: string) => {
    dispatch({ type: 'CYCLE_ROUND_VISIBILITY', payload: roundId });
  }, [dispatch]);

  const reorderRounds = useCallback((rounds: Round[]) => {
    if (isReadOnly) return;
    
    dispatch({ type: 'REORDER_ROUNDS', payload: rounds });
  }, [dispatch, isReadOnly]);

  const reorderVCs = useCallback((roundId: string, vcIds: string[]) => {
    if (isReadOnly) return;
    
    dispatch({ type: 'REORDER_VCS', payload: { roundId, vcIds } });
  }, [dispatch, isReadOnly]);

  const getRoundSummary = useCallback((roundId: string) => {
    // Find the round
    const round = state.rounds.find(r => r.id === roundId);
    if (!round) return null;
    
    // Get VCs in this round
    const roundVCs = round.vcs.map(vcId => state.vcs[vcId]).filter(Boolean);
    
    // Count by status
    const finalized = roundVCs.filter(vc => vc.status === 'finalized').length;
    const closeToBuying = roundVCs.filter(vc => vc.status === 'closeToBuying').length;
    
    // Calculate total committed
    const totalCommitted = roundVCs
      .filter(vc => vc.status === 'finalized')
      .reduce((sum, vc) => sum + (vc.purchaseAmount || 0), 0);
    
    const isOversubscribed = round.targetAmount ? totalCommitted > round.targetAmount : false;
    
    return {
      totalVCs: roundVCs.length,
      finalized,
      closeToBuying,
      totalCommitted,
      isOversubscribed,
    };
  }, [state]);

  return {
    toggleRoundExpand,
    cycleRoundVisibility,
    reorderRounds,
    reorderVCs,
    getRoundSummary,
  };
};

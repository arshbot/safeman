
import { useCallback } from 'react';
import { Round } from '@/types';
import { getRoundSummary as getRoundSummaryUtil } from '../crmUtils';
import { CRMState } from '@/types';

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
    return getRoundSummaryUtil(state, roundId);
  }, [state]);

  return {
    toggleRoundExpand,
    cycleRoundVisibility,
    reorderRounds,
    reorderVCs,
    getRoundSummary,
  };
};

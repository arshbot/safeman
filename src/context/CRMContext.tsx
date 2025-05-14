import React, { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { crmReducer } from './reducers';
import { initialState } from './storage';
import { CRMContextType, CRMState, AuthUser } from './types';
import { useAuth } from './AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import { useSharedAccess } from './hooks/useSharedAccess';
import { useDataPersistence } from './hooks/useDataPersistence';
import { useCrmActions } from './hooks/useCrmActions';
import { useUiActions } from './hooks/useUiActions';
import { useMeetingNotes } from './hooks/useMeetingNotes';
import { Round, VC, Status } from '@/types';

// Context
const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Provider
export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  // Shared access handling - now just returns fixed values
  const { isReadOnly } = useSharedAccess();

  // Data loading and persistence
  const { isSaving, saveError, retryCount, manualSave } = useDataPersistence(
    user,
    authLoading,
    dispatch,
    state,
    setIsLoading
  );

  // Action creators
  const crmActions = useCrmActions(dispatch, isReadOnly, state);
  const uiActions = useUiActions(dispatch, state, isReadOnly);
  const meetingNoteActions = useMeetingNotes(dispatch, isReadOnly);

  // Show appropriate loading state
  if (authLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading your data..." />;
  }

  // Implement missing methods
  const moveVCBetweenRounds = (vcId: string, sourceRoundId: string | null, destRoundId: string | null) => {
    if (isReadOnly) return;
    dispatch({ type: 'MOVE_VC_BETWEEN_ROUNDS', payload: { vcId, sourceRoundId, destRoundId } });
  };

  const expandVC = (vcId: string) => {
    dispatch({ type: 'EXPAND_VC', payload: vcId });
  };

  const collapseVC = (vcId: string) => {
    dispatch({ type: 'COLLAPSE_VC', payload: vcId });
  };

  const setVCStatus = (vcId: string, status: Status) => {
    if (isReadOnly) return;
    dispatch({ type: 'SET_VC_STATUS', payload: { vcId, status } });
  };

  const setRoundVCs = (roundId: string, vcIds: string[]) => {
    if (isReadOnly) return;
    dispatch({ type: 'SET_ROUND_VCS', payload: { roundId, vcIds } });
  };

  const removeRoundIdFromVC = (vcId: string, roundId: string) => {
    if (isReadOnly) return;
    dispatch({ type: 'REMOVE_VC_FROM_ROUND', payload: { vcId, roundId } });
  };

  const addRoundIdToVC = (vcId: string, roundId: string) => {
    if (isReadOnly) return;
    dispatch({ type: 'ADD_VC_TO_ROUND', payload: { vcId, roundId } });
  };

  const moveVCToUnsorted = (vcId: string) => {
    if (isReadOnly) return;
    // First find which round the VC is in
    for (const round of state.rounds) {
      if (round.vcs.includes(vcId)) {
        // Remove VC from round
        dispatch({ type: 'REMOVE_VC_FROM_ROUND', payload: { vcId, roundId: round.id } });
      }
    }
    // Add to unsortedVCs if it's not already there
    if (!state.unsortedVCs.includes(vcId)) {
      dispatch({ type: 'MOVE_VC_BETWEEN_ROUNDS', payload: { vcId, sourceRoundId: null, destRoundId: null } });
    }
  };

  const moveVCToRound = (vcId: string, roundId: string) => {
    if (isReadOnly) return;
    // First remove from unsortedVCs if it's there
    if (state.unsortedVCs.includes(vcId)) {
      dispatch({ type: 'MOVE_VC_BETWEEN_ROUNDS', payload: { vcId, sourceRoundId: null, destRoundId: roundId } });
    } else {
      // If it's in another round, find and remove it
      for (const round of state.rounds) {
        if (round.vcs.includes(vcId) && round.id !== roundId) {
          // Move between rounds
          dispatch({ type: 'MOVE_VC_BETWEEN_ROUNDS', payload: { vcId, sourceRoundId: round.id, destRoundId: roundId } });
          return;
        }
      }
      // If not found in any round, just add to the target round
      dispatch({ type: 'ADD_VC_TO_ROUND', payload: { vcId, roundId } });
    }
  };

  // Create context value with all required properties
  const contextValue: CRMContextType = {
    state,
    isReadOnly,
    isSaving,
    saveError,
    retryCount,
    manualSave,
    ...crmActions,
    ...uiActions,
    ...meetingNoteActions,
    // Add all missing methods
    moveVCBetweenRounds,
    setScratchpadNotes: (notes: string) => dispatch({ type: 'SET_SCRATCHPAD_NOTES', payload: notes }),
    expandRound: (roundId: string) => dispatch({ type: 'EXPAND_ROUND', payload: roundId }),
    collapseRound: (roundId: string) => dispatch({ type: 'COLLAPSE_ROUND', payload: roundId }),
    expandVC,
    collapseVC,
    setVCStatus,
    setRoundVCs,
    removeRoundIdFromVC,
    addRoundIdToVC,
    moveVCToUnsorted,
    moveVCToRound,
    getRoundSummary: uiActions.getRoundSummary,
  };

  return (
    <CRMContext.Provider value={contextValue}>
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

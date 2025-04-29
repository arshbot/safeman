
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
    // Add missing methods for proper type compatibility
    moveVCBetweenRounds: crmActions.moveVCBetweenRounds || (() => {}),
    setScratchpadNotes: (notes: string) => dispatch({ type: 'SET_SCRATCHPAD_NOTES', payload: notes }),
    expandRound: (roundId: string) => dispatch({ type: 'EXPAND_ROUND', payload: roundId }),
    collapseRound: (roundId: string) => dispatch({ type: 'COLLAPSE_ROUND', payload: roundId }),
    removeRoundIdFromVC: crmActions.removeRoundIdFromVC || (() => {}),
    addRoundIdToVC: crmActions.addRoundIdToVC || (() => {}),
    moveVCToUnsorted: crmActions.moveVCToUnsorted || (() => {}),
    moveVCToRound: crmActions.moveVCToRound || (() => {}),
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

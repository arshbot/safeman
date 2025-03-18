
import React, { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { CRMState } from '@/types';
import { crmReducer } from './reducers';
import { initialState } from './storage';
import { CRMContextType } from './types';
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
  const [state, dispatch] = useReducer(crmReducer, {
    ...initialState,
    isAddRoundModalOpen: false,
    isAddVcModalOpen: false,
    isEditRoundModalOpen: false,
    isEditVcModalOpen: false,
    selectedRoundId: null,
    selectedVcId: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  
  // Shared access handling
  const { isReadOnly, sharedOwnerId } = useSharedAccess(user);

  // Data loading and persistence
  useDataPersistence(
    user,
    authLoading,
    dispatch,
    state,
    isReadOnly,
    sharedOwnerId,
    setIsLoading
  );

  // Action creators
  const crmActions = useCrmActions(dispatch, isReadOnly, state);
  const uiActions = useUiActions(dispatch, state, isReadOnly);
  const meetingNoteActions = useMeetingNotes(dispatch, isReadOnly);

  // UI modal actions
  const openAddRoundModal = () => {
    if (isReadOnly) return;
    dispatch({ type: 'OPEN_ADD_ROUND_MODAL' });
  };

  const closeAddRoundModal = () => {
    dispatch({ type: 'CLOSE_ADD_ROUND_MODAL' });
  };

  const openAddVcModal = () => {
    if (isReadOnly) return;
    dispatch({ type: 'OPEN_ADD_VC_MODAL' });
  };

  const closeAddVcModal = () => {
    dispatch({ type: 'CLOSE_ADD_VC_MODAL' });
  };

  const openEditRoundModal = (roundId: string) => {
    if (isReadOnly) return;
    dispatch({ type: 'OPEN_EDIT_ROUND_MODAL', payload: roundId });
  };

  const closeEditRoundModal = () => {
    dispatch({ type: 'CLOSE_EDIT_ROUND_MODAL' });
  };

  const openEditVcModal = (vcId: string) => {
    if (isReadOnly) return;
    dispatch({ type: 'OPEN_EDIT_VC_MODAL', payload: vcId });
  };

  const closeEditVcModal = () => {
    dispatch({ type: 'CLOSE_EDIT_VC_MODAL' });
  };

  // Show appropriate loading state
  if (authLoading) {
    return <LoadingState message="Checking authentication..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading your data..." />;
  }

  return (
    <CRMContext.Provider
      value={{
        state,
        isReadOnly,
        ...crmActions,
        ...uiActions,
        ...meetingNoteActions,
        // Add UI modal actions
        openAddRoundModal,
        closeAddRoundModal,
        openAddVcModal,
        closeAddVcModal,
        openEditRoundModal,
        closeEditRoundModal,
        openEditVcModal,
        closeEditVcModal,
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

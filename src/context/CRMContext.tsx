
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

  return (
    <CRMContext.Provider
      value={{
        state,
        isReadOnly,
        isSaving,
        saveError,
        retryCount,
        manualSave,
        ...crmActions,
        ...uiActions,
        ...meetingNoteActions,
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


import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CRMState, Round, VC, MeetingNote } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { crmReducer } from './crmReducer';
import { loadState, saveState } from './storage';
import { getRoundSummary } from './crmUtils';
import { CRMContextType } from './types';

// Context
const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Provider
export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, loadState());

  // Save state to localStorage when it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addRound = (round: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded'>) => {
    dispatch({ type: 'ADD_ROUND', payload: round });
  };

  const updateRound = (round: Round) => {
    dispatch({ type: 'UPDATE_ROUND', payload: round });
  };

  const deleteRound = (roundId: string) => {
    dispatch({ type: 'DELETE_ROUND', payload: roundId });
  };

  const addVC = (vc: Omit<VC, 'id'>): string => {
    const id = uuidv4();
    dispatch({ type: 'ADD_VC', payload: { vc, id } });
    return id;
  };

  const updateVC = (vc: VC) => {
    dispatch({ type: 'UPDATE_VC', payload: vc });
  };

  const deleteVC = (vcId: string) => {
    dispatch({ type: 'DELETE_VC', payload: vcId });
  };

  const duplicateVC = (vcId: string, roundId: string) => {
    dispatch({ type: 'DUPLICATE_VC', payload: { vcId, roundId } });
  };

  const addVCToRound = (vcId: string, roundId: string) => {
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

  const reorderRounds = (rounds: Round[]) => {
    dispatch({ type: 'REORDER_ROUNDS', payload: rounds });
  };

  const reorderVCs = (roundId: string, vcIds: string[]) => {
    dispatch({ type: 'REORDER_VCS', payload: { roundId, vcIds } });
  };

  const getRoundSummaryFn = (roundId: string) => {
    return getRoundSummary(state, roundId);
  };

  const addMeetingNote = (vcId: string, content: string) => {
    const note: MeetingNote = {
      id: uuidv4(),
      date: new Date().toISOString(),
      content,
    };
    
    dispatch({ type: 'ADD_MEETING_NOTE', payload: { vcId, note } });
  };
  
  const updateMeetingNote = (vcId: string, note: MeetingNote) => {
    dispatch({ type: 'UPDATE_MEETING_NOTE', payload: { vcId, note } });
  };
  
  const deleteMeetingNote = (vcId: string, noteId: string) => {
    dispatch({ type: 'DELETE_MEETING_NOTE', payload: { vcId, noteId } });
  };

  return (
    <CRMContext.Provider
      value={{
        state,
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

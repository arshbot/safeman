
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CRMState, Round, VC, Status } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Initial state
const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
};

// Load state from localStorage
const loadState = (): CRMState => {
  try {
    const serializedState = localStorage.getItem('crmState');
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return initialState;
  }
};

// Actions
type Action =
  | { type: 'ADD_ROUND'; payload: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded'> }
  | { type: 'UPDATE_ROUND'; payload: Round }
  | { type: 'DELETE_ROUND'; payload: string }
  | { type: 'ADD_VC'; payload: { vc: Omit<VC, 'id'>; id: string } }
  | { type: 'UPDATE_VC'; payload: VC }
  | { type: 'DELETE_VC'; payload: string }
  | { type: 'DUPLICATE_VC'; payload: { vcId: string; roundId: string } }
  | { type: 'ADD_VC_TO_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'REMOVE_VC_FROM_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'TOGGLE_ROUND_EXPAND'; payload: string }
  | { type: 'REORDER_ROUNDS'; payload: Round[] }
  | { type: 'REORDER_VCS'; payload: { roundId: string; vcIds: string[] } };

// Reducer
const crmReducer = (state: CRMState, action: Action): CRMState => {
  switch (action.type) {
    case 'ADD_ROUND': {
      const newRound: Round = {
        id: uuidv4(),
        ...action.payload,
        vcs: [],
        order: state.rounds.length,
        isExpanded: false,
      };
      
      toast.success(`Round ${newRound.name} created`);
      
      return {
        ...state,
        rounds: [...state.rounds, newRound],
      };
    }

    case 'UPDATE_ROUND': {
      toast.success(`Round ${action.payload.name} updated`);
      
      return {
        ...state,
        rounds: state.rounds.map((round) =>
          round.id === action.payload.id ? action.payload : round
        ),
      };
    }

    case 'DELETE_ROUND': {
      const roundToDelete = state.rounds.find(r => r.id === action.payload);
      if (roundToDelete) {
        toast.success(`Round ${roundToDelete.name} deleted`);
      }
      
      // Move VCs from this round to unsorted
      const roundVCs = state.rounds.find((r) => r.id === action.payload)?.vcs || [];
      
      return {
        ...state,
        rounds: state.rounds.filter((round) => round.id !== action.payload),
        unsortedVCs: [...state.unsortedVCs, ...roundVCs],
      };
    }

    case 'ADD_VC': {
      const { vc, id } = action.payload;
      const newVC: VC = {
        id,
        ...vc,
      };
      
      toast.success(`VC ${newVC.name} added`);
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [newVC.id]: newVC,
        },
        unsortedVCs: [...state.unsortedVCs, newVC.id],
      };
    }

    case 'UPDATE_VC': {
      toast.success(`VC ${action.payload.name} updated`);
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [action.payload.id]: action.payload,
        },
      };
    }

    case 'DELETE_VC': {
      const vcToDelete = state.vcs[action.payload];
      if (vcToDelete) {
        toast.success(`VC ${vcToDelete.name} deleted`);
      }
      
      // Create a new vcs object without the deleted VC
      const { [action.payload]: _, ...remainingVCs } = state.vcs;
      
      // Remove the VC from all rounds and unsorted
      return {
        ...state,
        vcs: remainingVCs,
        rounds: state.rounds.map((round) => ({
          ...round,
          vcs: round.vcs.filter((vcId) => vcId !== action.payload),
        })),
        unsortedVCs: state.unsortedVCs.filter((vcId) => vcId !== action.payload),
      };
    }

    case 'DUPLICATE_VC': {
      const { vcId, roundId } = action.payload;
      const originalVC = state.vcs[vcId];
      
      if (!originalVC) return state;
      
      const duplicatedVC: VC = {
        ...originalVC,
        id: uuidv4(),
      };
      
      toast.success(`VC ${duplicatedVC.name} duplicated`);
      
      // Find the target round
      const updatedRounds = state.rounds.map((round) => {
        if (round.id === roundId) {
          return {
            ...round,
            vcs: [...round.vcs, duplicatedVC.id],
          };
        }
        return round;
      });
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [duplicatedVC.id]: duplicatedVC,
        },
        rounds: updatedRounds,
      };
    }

    case 'ADD_VC_TO_ROUND': {
      const { vcId, roundId } = action.payload;
      const vc = state.vcs[vcId];
      const round = state.rounds.find(r => r.id === roundId);
      
      if (!vc || !round) return state;
      
      // Only add if not already in the round
      if (round.vcs.includes(vcId)) return state;
      
      toast.success(`Added ${vc.name} to ${round.name}`);
      
      return {
        ...state,
        rounds: state.rounds.map((round) => {
          if (round.id === roundId) {
            return {
              ...round,
              vcs: [...round.vcs, vcId],
            };
          }
          return round;
        }),
        unsortedVCs: state.unsortedVCs.filter((id) => id !== vcId),
      };
    }

    case 'REMOVE_VC_FROM_ROUND': {
      const { vcId, roundId } = action.payload;
      const vc = state.vcs[vcId];
      const round = state.rounds.find(r => r.id === roundId);
      
      if (!vc || !round) return state;
      
      toast.success(`Removed ${vc.name} from ${round.name}`);
      
      return {
        ...state,
        rounds: state.rounds.map((round) => {
          if (round.id === roundId) {
            return {
              ...round,
              vcs: round.vcs.filter((id) => id !== vcId),
            };
          }
          return round;
        }),
        unsortedVCs: [...state.unsortedVCs, vcId],
      };
    }

    case 'TOGGLE_ROUND_EXPAND': {
      return {
        ...state,
        rounds: state.rounds.map((round) => {
          if (round.id === action.payload) {
            return {
              ...round,
              isExpanded: !round.isExpanded,
            };
          }
          return round;
        }),
      };
    }

    case 'REORDER_ROUNDS': {
      return {
        ...state,
        rounds: action.payload,
      };
    }

    case 'REORDER_VCS': {
      const { roundId, vcIds } = action.payload;
      return {
        ...state,
        rounds: state.rounds.map(round => 
          round.id === roundId
            ? { ...round, vcs: vcIds }
            : round
        ),
      };
    }

    default:
      return state;
  }
};

// Context
interface CRMContextType {
  state: CRMState;
  addRound: (round: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded'>) => void;
  updateRound: (round: Round) => void;
  deleteRound: (roundId: string) => void;
  addVC: (vc: Omit<VC, 'id'>) => string;
  updateVC: (vc: VC) => void;
  deleteVC: (vcId: string) => void;
  duplicateVC: (vcId: string, roundId: string) => void;
  addVCToRound: (vcId: string, roundId: string) => void;
  removeVCFromRound: (vcId: string, roundId: string) => void;
  toggleRoundExpand: (roundId: string) => void;
  reorderRounds: (rounds: Round[]) => void;
  reorderVCs: (roundId: string, vcIds: string[]) => void;
  getRoundSummary: (roundId: string) => { totalVCs: number; sold: number; closeToBuying: number };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

// Provider
export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, loadState());

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('crmState', JSON.stringify(state));
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
    dispatch({ type: 'ADD_VC_TO_ROUND', payload: { vcId, roundId } });
  };

  const removeVCFromRound = (vcId: string, roundId: string) => {
    dispatch({ type: 'REMOVE_VC_FROM_ROUND', payload: { vcId, roundId } });
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

  const getRoundSummary = (roundId: string) => {
    const round = state.rounds.find((r) => r.id === roundId);
    if (!round) {
      return { totalVCs: 0, sold: 0, closeToBuying: 0 };
    }

    const vcsInRound = round.vcs
      .map((vcId) => state.vcs[vcId])
      .filter(Boolean);

    return {
      totalVCs: vcsInRound.length,
      sold: vcsInRound.filter((vc) => vc.status === 'sold').length,
      closeToBuying: vcsInRound.filter((vc) => vc.status === 'closeToBuying').length,
    };
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
        getRoundSummary,
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

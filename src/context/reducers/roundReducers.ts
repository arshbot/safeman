
import { CRMState, Round, RoundVisibility } from '@/types';
import { CRMAction } from '../types';
import { toast } from 'sonner';

// Helper function to cycle round visibility
const cycleVisibility = (currentVisibility: RoundVisibility): RoundVisibility => {
  switch (currentVisibility) {
    case 'expanded':
      return 'collapsedShowFinalized';
    case 'collapsedShowFinalized':
      return 'collapsedHideAll';
    case 'collapsedHideAll':
      return 'expanded';
    default:
      return 'expanded';
  }
};

// Reducers for round-related actions
export const roundReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'ADD_ROUND': {
      const newRound: Round = {
        ...action.payload,
        vcs: [],
        order: state.rounds.length,
        isExpanded: false,
        visibility: 'expanded',
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
      
      // Get all VCs in this round
      const roundVCs = state.rounds.find((r) => r.id === action.payload)?.vcs || [];
      
      // Create a new vcs object without the VCs from the deleted round
      const updatedVCs = { ...state.vcs };
      for (const vcId of roundVCs) {
        delete updatedVCs[vcId];
      }
      
      return {
        ...state,
        rounds: state.rounds.filter((round) => round.id !== action.payload),
        vcs: updatedVCs
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

    case 'CYCLE_ROUND_VISIBILITY': {
      return {
        ...state,
        rounds: state.rounds.map((round) => {
          if (round.id === action.payload) {
            const newVisibility = cycleVisibility(round.visibility);
            return {
              ...round,
              visibility: newVisibility,
            };
          }
          return round;
        }),
      };
    }

    default:
      return state;
  }
};

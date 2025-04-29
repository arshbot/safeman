
import { CRMState, CRMAction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Round, RoundVisibility } from '@/types';

export const roundReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'ADD_ROUND': {
      const { name, targetAmount, valuationCap } = action.payload;
      const newRound: Round = {
        id: uuidv4(),
        name,
        vcs: [],
        order: state.rounds.length,
        isExpanded: false,
        visibility: 'expanded' as RoundVisibility,
        targetAmount,
        valuationCap
      };
      
      return {
        ...state,
        rounds: [...state.rounds, newRound]
      };
    }
    
    case 'UPDATE_ROUND': {
      const updatedRound = action.payload;
      
      return {
        ...state,
        rounds: state.rounds.map(round => 
          round.id === updatedRound.id ? { ...round, ...updatedRound } : round
        )
      };
    }
    
    case 'DELETE_ROUND': {
      const roundId = action.payload;
      const roundToDelete = state.rounds.find(r => r.id === roundId);
      
      if (!roundToDelete) {
        return state;
      }
      
      // Move all VCs from the round to unsorted
      const vcsToMove = roundToDelete.vcs || [];
      
      return {
        ...state,
        rounds: state.rounds.filter(r => r.id !== roundId),
        unsortedVCs: [...state.unsortedVCs, ...vcsToMove]
      };
    }
    
    case 'EXPAND_ROUND': {
      const roundId = action.payload;
      
      return {
        ...state,
        expandedRoundIds: state.expandedRoundIds.includes(roundId) 
          ? state.expandedRoundIds 
          : [...state.expandedRoundIds, roundId]
      };
    }
    
    case 'COLLAPSE_ROUND': {
      const roundId = action.payload;
      
      return {
        ...state,
        expandedRoundIds: state.expandedRoundIds.filter(id => id !== roundId)
      };
    }
    
    case 'TOGGLE_ROUND_EXPAND': {
      const roundId = action.payload;
      
      return {
        ...state,
        expandedRoundIds: state.expandedRoundIds.includes(roundId)
          ? state.expandedRoundIds.filter(id => id !== roundId)
          : [...state.expandedRoundIds, roundId]
      };
    }
    
    case 'CYCLE_ROUND_VISIBILITY': {
      const roundId = action.payload;
      const round = state.rounds.find(r => r.id === roundId);
      
      if (!round) {
        return state;
      }
      
      let newVisibility: RoundVisibility;
      
      switch (round.visibility) {
        case 'expanded':
          newVisibility = 'collapsedShowFinalized';
          break;
        case 'collapsedShowFinalized':
          newVisibility = 'collapsedHideAll';
          break;
        default:
          newVisibility = 'expanded';
      }
      
      return {
        ...state,
        rounds: state.rounds.map(r => 
          r.id === roundId ? { ...r, visibility: newVisibility } : r
        )
      };
    }
    
    default:
      return state;
  }
};

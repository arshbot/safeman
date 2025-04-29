
import { CRMState, CRMAction } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const vcReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'ADD_VC': {
      const { id, vc } = action.payload;
      const newVC = {
        id,
        ...vc
      };
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [id]: newVC
        },
        unsortedVCs: [...state.unsortedVCs, id]
      };
    }
    
    case 'UPDATE_VC': {
      const updatedVC = action.payload;
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [updatedVC.id]: updatedVC
        }
      };
    }
    
    case 'DELETE_VC': {
      const vcId = action.payload;
      const { [vcId]: _, ...remainingVCs } = state.vcs;
      
      // Also remove from rounds and unsorted
      const updatedRounds = state.rounds.map(round => ({
        ...round,
        vcs: round.vcs.filter(id => id !== vcId)
      }));
      
      return {
        ...state,
        vcs: remainingVCs,
        rounds: updatedRounds,
        unsortedVCs: state.unsortedVCs.filter(id => id !== vcId),
        expandedVCIds: state.expandedVCIds.filter(id => id !== vcId)
      };
    }
    
    case 'DUPLICATE_VC': {
      const { vcId, roundId } = action.payload;
      const originalVC = state.vcs[vcId];
      
      if (!originalVC) {
        return state;
      }
      
      // Create new VC with same properties but new ID
      const newId = uuidv4();
      const newVC = {
        ...originalVC,
        id: newId,
        name: `${originalVC.name} (copy)`
      };
      
      // Add to the specified round
      const updatedRound = state.rounds.find(r => r.id === roundId);
      
      if (!updatedRound) {
        return {
          ...state,
          vcs: { ...state.vcs, [newId]: newVC },
          unsortedVCs: [...state.unsortedVCs, newId]
        };
      }
      
      return {
        ...state,
        vcs: { ...state.vcs, [newId]: newVC },
        rounds: state.rounds.map(r => 
          r.id === roundId 
            ? { ...r, vcs: [...r.vcs, newId] } 
            : r
        )
      };
    }
    
    case 'ADD_VC_TO_ROUND': {
      const { vcId, roundId } = action.payload;
      
      // Check if VC exists
      if (!state.vcs[vcId]) {
        return state;
      }
      
      // Check if round exists
      const targetRound = state.rounds.find(r => r.id === roundId);
      if (!targetRound) {
        return state;
      }
      
      // If VC already in this round, don't duplicate
      if (targetRound.vcs.includes(vcId)) {
        return state;
      }
      
      // Add VC to round
      return {
        ...state,
        rounds: state.rounds.map(r => 
          r.id === roundId 
            ? { ...r, vcs: [...r.vcs, vcId] } 
            : r
        ),
        // Remove from unsorted if it was there
        unsortedVCs: state.unsortedVCs.filter(id => id !== vcId)
      };
    }
    
    case 'REMOVE_VC_FROM_ROUND': {
      const { vcId, roundId } = action.payload;
      
      // Remove VC from the specified round
      return {
        ...state,
        rounds: state.rounds.map(r => 
          r.id === roundId 
            ? { ...r, vcs: r.vcs.filter(id => id !== vcId) } 
            : r
        ),
        // Add to unsorted
        unsortedVCs: state.unsortedVCs.includes(vcId) 
          ? state.unsortedVCs 
          : [...state.unsortedVCs, vcId]
      };
    }
    
    case 'MOVE_VC_BETWEEN_ROUNDS': {
      const { vcId, sourceRoundId, destRoundId } = action.payload;
      
      // Handle moving from unsorted to a round
      if (!sourceRoundId && destRoundId) {
        return {
          ...state,
          rounds: state.rounds.map(r => 
            r.id === destRoundId 
              ? { ...r, vcs: [...r.vcs, vcId] } 
              : r
          ),
          unsortedVCs: state.unsortedVCs.filter(id => id !== vcId)
        };
      }
      
      // Handle moving from a round to unsorted
      if (sourceRoundId && !destRoundId) {
        return {
          ...state,
          rounds: state.rounds.map(r => 
            r.id === sourceRoundId 
              ? { ...r, vcs: r.vcs.filter(id => id !== vcId) } 
              : r
          ),
          unsortedVCs: [...state.unsortedVCs, vcId]
        };
      }
      
      // Handle moving between two rounds
      if (sourceRoundId && destRoundId) {
        return {
          ...state,
          rounds: state.rounds.map(r => {
            if (r.id === sourceRoundId) {
              return { ...r, vcs: r.vcs.filter(id => id !== vcId) };
            }
            if (r.id === destRoundId) {
              return { ...r, vcs: [...r.vcs, vcId] };
            }
            return r;
          })
        };
      }
      
      return state;
    }
    
    case 'EXPAND_VC': {
      const vcId = action.payload;
      
      return {
        ...state,
        expandedVCIds: state.expandedVCIds.includes(vcId) 
          ? state.expandedVCIds 
          : [...state.expandedVCIds, vcId]
      };
    }
    
    case 'COLLAPSE_VC': {
      const vcId = action.payload;
      
      return {
        ...state,
        expandedVCIds: state.expandedVCIds.filter(id => id !== vcId)
      };
    }
    
    case 'SET_VC_STATUS': {
      const { vcId, status } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc) {
        return state;
      }
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: {
            ...vc,
            status
          }
        }
      };
    }
    
    default:
      return state;
  }
};

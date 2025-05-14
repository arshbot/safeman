
import { CRMState, CRMAction } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Status } from '@/types';

export const coreVCReducers = (state: CRMState, action: CRMAction): CRMState => {
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
      
      // Check if VC exists before trying to banish
      if (!state.vcs[vcId]) {
        return state;
      }
      
      // Instead of deleting, update the VC to have "banished" status
      const updatedVCs = {
        ...state.vcs,
        [vcId]: {
          ...state.vcs[vcId],
          status: 'banished' as Status
        }
      };
      
      // Remove from rounds and unsorted
      const updatedRounds = state.rounds.map(round => ({
        ...round,
        vcs: round.vcs.filter(id => id !== vcId)
      }));
      
      return {
        ...state,
        vcs: updatedVCs,
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
    
    default:
      return state;
  }
};

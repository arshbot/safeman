
import { CRMState, CRMAction } from '../../types';

export const roundVCReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
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
    
    default:
      return state;
  }
};

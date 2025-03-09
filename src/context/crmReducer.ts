
import { CRMState, Round, VC, Status, MeetingNote, RoundVisibility } from '@/types';
import { CRMAction } from './types';
import { v4 as uuidv4 } from 'uuid';
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

// Reducer
export const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'ADD_ROUND': {
      const newRound: Round = {
        id: uuidv4(),
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
      console.log(`[DEBUG REDUCER] ADD_VC_TO_ROUND action with vcId: ${vcId}, roundId: ${roundId}`);
      
      const vc = state.vcs[vcId];
      const round = state.rounds.find(r => r.id === roundId);
      
      if (!vc) {
        console.error(`[DEBUG REDUCER] VC with id ${vcId} not found in state.vcs`);
        return state;
      }
      
      if (!round) {
        console.error(`[DEBUG REDUCER] Round with id ${roundId} not found`);
        return state;
      }
      
      // Only add if not already in the round
      if (round.vcs.includes(vcId)) {
        console.log(`[DEBUG REDUCER] VC ${vcId} already in round ${roundId}, skipping`);
        return state;
      }
      
      console.log(`[DEBUG REDUCER] Adding ${vc.name} to ${round.name}`);
      console.log(`[DEBUG REDUCER] Current unsortedVCs:`, state.unsortedVCs);
      console.log(`[DEBUG REDUCER] IsVCInUnsorted:`, state.unsortedVCs.includes(vcId));
      
      // Create the updated state
      const updatedRounds = state.rounds.map((r) => {
        if (r.id === roundId) {
          console.log(`[DEBUG REDUCER] Updating round ${r.id} VCs`, [...r.vcs, vcId]);
          return {
            ...r,
            vcs: [...r.vcs, vcId],
          };
        }
        return r;
      });
      
      const updatedUnsortedVCs = state.unsortedVCs.filter((id) => id !== vcId);
      console.log(`[DEBUG REDUCER] Updated unsortedVCs:`, updatedUnsortedVCs);
      
      toast.success(`Added ${vc.name} to ${round.name}`);
      
      // Return the updated state
      const newState = {
        ...state,
        rounds: updatedRounds,
        unsortedVCs: updatedUnsortedVCs,
      };
      
      console.log(`[DEBUG REDUCER] New state after ADD_VC_TO_ROUND:`);
      console.log(`[DEBUG REDUCER] - unsortedVCs:`, newState.unsortedVCs);
      console.log(`[DEBUG REDUCER] - round ${roundId} VCs:`, newState.rounds.find(r => r.id === roundId)?.vcs);
      
      return newState;
    }

    case 'REMOVE_VC_FROM_ROUND': {
      const { vcId, roundId } = action.payload;
      console.log(`[DEBUG REDUCER] REMOVE_VC_FROM_ROUND action with vcId: ${vcId}, roundId: ${roundId}`);
      
      const vc = state.vcs[vcId];
      const round = state.rounds.find(r => r.id === roundId);
      
      if (!vc) {
        console.error(`[DEBUG REDUCER] Could not find VC ${vcId}`);
        return state;
      }
      
      if (!round) {
        console.error(`[DEBUG REDUCER] Could not find round ${roundId}`);
        return state;
      }
      
      console.log(`[DEBUG REDUCER] Removing ${vc.name} from ${round.name} and adding to unsorted`);
      
      // Check if the VC is actually in this round
      if (!round.vcs.includes(vcId)) {
        console.error(`[DEBUG REDUCER] VC ${vcId} not found in round ${roundId}`);
        return state;
      }
      
      // Remove from round
      const updatedRounds = state.rounds.map(r => {
        if (r.id === roundId) {
          return {
            ...r,
            vcs: r.vcs.filter(id => id !== vcId),
          };
        }
        return r;
      });
      
      console.log(`[DEBUG REDUCER] Updated rounds after removal: `, updatedRounds.find(r => r.id === roundId)?.vcs);
      
      // Add to unsorted (if not already there)
      const isAlreadyInUnsorted = state.unsortedVCs.includes(vcId);
      console.log(`[DEBUG REDUCER] Is VC ${vcId} already in unsorted? ${isAlreadyInUnsorted}`);
      
      if (isAlreadyInUnsorted) {
        console.log(`[DEBUG REDUCER] VC ${vcId} is already in unsorted, only removing from round`);
        return {
          ...state,
          rounds: updatedRounds
        };
      }
      
      console.log(`[DEBUG REDUCER] Adding VC ${vcId} to unsorted VCs`);
      toast.success(`Removed ${vc.name} from ${round.name}`);
      
      // Create and return updated state
      const newState = {
        ...state,
        rounds: updatedRounds,
        unsortedVCs: [...state.unsortedVCs, vcId]
      };
      
      console.log(`[DEBUG REDUCER] New state after REMOVE_VC_FROM_ROUND:`);
      console.log(`[DEBUG REDUCER] - unsortedVCs:`, newState.unsortedVCs);
      console.log(`[DEBUG REDUCER] - round ${roundId} VCs:`, newState.rounds.find(r => r.id === roundId)?.vcs);
      
      return newState;
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

    case 'ADD_MEETING_NOTE': {
      const { vcId, note } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc) return state;
      
      const updatedVC = {
        ...vc,
        meetingNotes: [...(vc.meetingNotes || []), note],
      };
      
      toast.success(`Added new meeting note for ${vc.name}`);
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: updatedVC,
        },
      };
    }

    case 'UPDATE_MEETING_NOTE': {
      const { vcId, note } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc || !vc.meetingNotes) return state;
      
      const updatedNotes = vc.meetingNotes.map(n => 
        n.id === note.id ? note : n
      );
      
      toast.success(`Updated meeting note for ${vc.name}`);
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: {
            ...vc,
            meetingNotes: updatedNotes,
          },
        },
      };
    }

    case 'DELETE_MEETING_NOTE': {
      const { vcId, noteId } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc || !vc.meetingNotes) return state;
      
      const updatedNotes = vc.meetingNotes.filter(n => n.id !== noteId);
      
      toast.success(`Deleted meeting note for ${vc.name}`);
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: {
            ...vc,
            meetingNotes: updatedNotes,
          },
        },
      };
    }

    default:
      return state;
  }
};


import { CRMState, Round, VC, Status, MeetingNote } from '@/types';
import { CRMAction } from './types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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
      
      if (!vc || !round) {
        console.error(`Could not find VC ${vcId} or round ${roundId}`);
        return state;
      }
      
      console.log(`Removing ${vc.name} from ${round.name} and adding to unsorted`);
      
      // Check if the VC is actually in this round
      if (!round.vcs.includes(vcId)) {
        console.error(`VC ${vcId} not found in round ${roundId}`);
        return state;
      }
      
      // Check if the VC is already in unsorted
      if (state.unsortedVCs.includes(vcId)) {
        console.error(`VC ${vcId} already in unsorted`);
        // Only remove from the round
        return {
          ...state,
          rounds: state.rounds.map((r) => {
            if (r.id === roundId) {
              return {
                ...r,
                vcs: r.vcs.filter((id) => id !== vcId),
              };
            }
            return r;
          }),
        };
      }
      
      toast.success(`Removed ${vc.name} from ${round.name}`);
      
      return {
        ...state,
        rounds: state.rounds.map((r) => {
          if (r.id === roundId) {
            return {
              ...r,
              vcs: r.vcs.filter((id) => id !== vcId),
            };
          }
          return r;
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

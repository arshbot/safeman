
import { CRMState, VC } from '@/types';
import { CRMAction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

// Reducers for VC-related actions
export const vcReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'ADD_VC': {
      const { id, vc } = action.payload;
      const newVC: VC = {
        id,
        ...vc,
      };
      
      toast({
        title: "VC Added",
        description: `${newVC.name} has been added`,
      });
      
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
      toast({
        title: "VC Updated",
        description: `${action.payload.name} has been updated`,
      });
      
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
        toast({
          title: "VC Deleted",
          description: `${vcToDelete.name} has been deleted`,
        });
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
      
      toast({
        title: "VC Duplicated",
        description: `${duplicatedVC.name} has been duplicated`,
      });
      
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
      
      toast({
        title: "VC Added to Round",
        description: `Added ${vc.name} to ${round.name}`,
      });
      
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
      toast({
        title: "VC Removed from Round",
        description: `Removed ${vc.name} from ${round.name}`,
      });
      
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

    default:
      return state;
  }
};

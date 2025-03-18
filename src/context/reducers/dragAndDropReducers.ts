
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { toast } from 'sonner';

// Reducers for drag-and-drop / reordering actions
export const dragAndDropReducers = (state: CRMState, action: CRMAction): CRMState => {
  if (action.type === 'REORDER_ROUNDS') {
    toast.success("Rounds reordered successfully");
    return {
      ...state,
      rounds: action.payload,
    };
  }

  if (action.type === 'REORDER_VCS') {
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

  return state;
};

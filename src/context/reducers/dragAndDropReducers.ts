
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { toast } from 'sonner';

// Reducers for drag-and-drop / reordering actions
export const dragAndDropReducers = (state: CRMState, action: CRMAction): CRMState => {
  if (action.type === 'REORDER_ROUNDS') {
    toast.success("Rounds reordered successfully");
    return {
      ...state,
      rounds: action.payload as any, // Type cast to avoid type error
    };
  }

  if (action.type === 'REORDER_VCS') {
    const payload = action.payload as { roundId: string, vcIds: string[] };
    const { roundId, vcIds } = payload;
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

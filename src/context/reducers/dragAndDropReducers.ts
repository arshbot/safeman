
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { toast } from 'sonner';

// Define a more specific type for drag and drop actions
type DragDropAction = 
  | { type: 'REORDER_ROUNDS'; payload: any }
  | { type: 'REORDER_VCS'; payload: { roundId: string; vcIds: string[] } };

// Reducers for drag-and-drop / reordering actions
export const dragAndDropReducers = (state: CRMState, action: DragDropAction): CRMState => {
  switch (action.type) {
    case 'REORDER_ROUNDS': {
      toast.success("Rounds reordered successfully");
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

    default:
      return state;
  }
};


import { CRMState, CRMAction } from '../types';

export const scratchpadReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'SET_SCRATCHPAD_NOTES': {
      return {
        ...state,
        scratchpadNotes: action.payload,
      };
    }
    
    default:
      return state;
  }
};


import { coreVCReducers } from './coreVCReducers';
import { roundVCReducers } from './roundVCReducers';
import { vcStatusReducers } from './vcStatusReducers';
import { CRMState, CRMAction } from '../../types';

// Main VC reducer that delegates to specific sub-reducers based on action type
export const vcReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    // Core VC operations
    case 'ADD_VC':
    case 'UPDATE_VC':
    case 'DELETE_VC':
    case 'DUPLICATE_VC':
      return coreVCReducers(state, action);
    
    // Round-VC relationship operations  
    case 'ADD_VC_TO_ROUND':
    case 'REMOVE_VC_FROM_ROUND':
    case 'MOVE_VC_BETWEEN_ROUNDS':
      return roundVCReducers(state, action);
    
    // VC UI state and status operations
    case 'EXPAND_VC':
    case 'COLLAPSE_VC':
    case 'SET_VC_STATUS':
      return vcStatusReducers(state, action);
      
    default:
      return state;
  }
};

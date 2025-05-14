
import { CRMState, CRMAction } from '../../types';

export const vcStatusReducers = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'EXPAND_VC': {
      const vcId = action.payload;
      
      return {
        ...state,
        expandedVCIds: state.expandedVCIds.includes(vcId) 
          ? state.expandedVCIds 
          : [...state.expandedVCIds, vcId]
      };
    }
    
    case 'COLLAPSE_VC': {
      const vcId = action.payload;
      
      return {
        ...state,
        expandedVCIds: state.expandedVCIds.filter(id => id !== vcId)
      };
    }
    
    case 'SET_VC_STATUS': {
      const { vcId, status } = action.payload;
      const vc = state.vcs[vcId];
      
      if (!vc) {
        return state;
      }
      
      return {
        ...state,
        vcs: {
          ...state.vcs,
          [vcId]: {
            ...vc,
            status
          }
        }
      };
    }
    
    default:
      return state;
  }
};

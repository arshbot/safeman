// This file serves as the entry point for all reducers
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { roundReducers } from './roundReducers';
import { vcReducers } from './vcReducers';
import { meetingNoteReducers } from './meetingNoteReducers';
import { dragAndDropReducers } from './dragAndDropReducers';

// Main reducer that delegates to specific reducers based on action type
export const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  // Special action for initializing state
  if (action.type === 'INITIALIZE_STATE') {
    return action.payload as CRMState;
  }
  
  // Round-related actions
  if (action.type.startsWith('ADD_ROUND') || 
      action.type.startsWith('UPDATE_ROUND') || 
      action.type.startsWith('DELETE_ROUND') ||
      action.type.startsWith('TOGGLE_ROUND') ||
      action.type.startsWith('CYCLE_ROUND')) {
    return roundReducers(state, action);
  }
  
  // VC-related actions
  if (action.type.startsWith('ADD_VC') || 
      action.type.startsWith('UPDATE_VC') || 
      action.type.startsWith('DELETE_VC') ||
      action.type.startsWith('DUPLICATE_VC') ||
      action.type.startsWith('ADD_VC_TO') ||
      action.type.startsWith('REMOVE_VC')) {
    return vcReducers(state, action);
  }
  
  // Meeting notes actions
  if (action.type.includes('MEETING_NOTE')) {
    return meetingNoteReducers(state, action);
  }
  
  // Drag and drop / reordering actions
  if (action.type.startsWith('REORDER')) {
    return dragAndDropReducers(state, action);
  }
  
  // UI modal actions
  if (action.type === 'OPEN_ADD_ROUND_MODAL') {
    return { ...state, isAddRoundModalOpen: true };
  }
  
  if (action.type === 'CLOSE_ADD_ROUND_MODAL') {
    return { ...state, isAddRoundModalOpen: false };
  }
  
  if (action.type === 'OPEN_ADD_VC_MODAL') {
    return { ...state, isAddVcModalOpen: true };
  }
  
  if (action.type === 'CLOSE_ADD_VC_MODAL') {
    return { ...state, isAddVcModalOpen: false };
  }
  
  if (action.type === 'OPEN_EDIT_ROUND_MODAL') {
    return { 
      ...state, 
      isEditRoundModalOpen: true,
      selectedRoundId: action.payload 
    };
  }
  
  if (action.type === 'CLOSE_EDIT_ROUND_MODAL') {
    return { ...state, isEditRoundModalOpen: false, selectedRoundId: null };
  }
  
  if (action.type === 'OPEN_EDIT_VC_MODAL') {
    return { 
      ...state, 
      isEditVcModalOpen: true,
      selectedVcId: action.payload 
    };
  }
  
  if (action.type === 'CLOSE_EDIT_VC_MODAL') {
    return { ...state, isEditVcModalOpen: false, selectedVcId: null };
  }
  
  // Default case - return state unchanged
  return state;
};

// This file serves as the entry point for all reducers
import { CRMState } from '@/types';
import { CRMAction } from '../types';
import { roundReducers } from './roundReducers';
import { vcReducers } from './vcReducers';
import { meetingNoteReducers } from './meetingNoteReducers';
import { dragAndDropReducers } from './dragAndDropReducers';
import { scratchpadReducers } from './scratchpadReducers';

// Main reducer that delegates to specific reducers based on action type
export const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  // Special action for initializing state
  if (action.type === 'INITIALIZE_STATE') {
    return action.payload;
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
  
  // Scratchpad actions
  if (action.type.startsWith('SET_SCRATCHPAD')) {
    return scratchpadReducers(state, action);
  }
  
  // Default case - return state unchanged
  return state;
};

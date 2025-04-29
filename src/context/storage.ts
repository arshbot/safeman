
import { CRMState } from './types';
import { v4 as uuidv4 } from 'uuid';

// Initial state for the CRM
export const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
  scratchpadNotes: '',
  expandedRoundIds: [],
  expandedVCIds: [],
};

// Save state to localStorage (for development/demo purposes)
export const saveState = async (state: CRMState): Promise<void> => {
  try {
    localStorage.setItem('crm-state', JSON.stringify(state));
    return Promise.resolve();
  } catch (error) {
    console.error('Error saving state:', error);
    return Promise.reject(error);
  }
};

// Load state from localStorage (for development/demo purposes)
export const loadState = async (): Promise<CRMState | null> => {
  try {
    const savedState = localStorage.getItem('crm-state');
    return savedState ? Promise.resolve(JSON.parse(savedState)) : Promise.resolve(null);
  } catch (error) {
    console.error('Error loading state:', error);
    return Promise.reject(error);
  }
};

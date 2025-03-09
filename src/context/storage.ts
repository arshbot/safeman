
import { CRMState } from '@/types';

// Initial state
export const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
};

// Load state from localStorage
export const loadState = (): CRMState => {
  try {
    const serializedState = localStorage.getItem('crmState');
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return initialState;
  }
};

// Save state to localStorage
export const saveState = (state: CRMState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('crmState', serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage', err);
  }
};

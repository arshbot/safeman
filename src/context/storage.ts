
import { CRMState } from '@/types';

// Initial state
export const initialState: CRMState = {
  rounds: [],
  vcs: {},
  unsortedVCs: [],
};

// Load state from localStorage with user-specific key
export const loadState = (): CRMState => {
  try {
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    const serializedState = localStorage.getItem(storageKey);
    if (serializedState === null) {
      return initialState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage', err);
    return initialState;
  }
};

// Save state to localStorage with user-specific key
export const saveState = (state: CRMState): void => {
  try {
    const userId = localStorage.getItem('clerk-user-id');
    const storageKey = userId ? `crmState-${userId}` : 'crmState-anonymous';
    
    const serializedState = JSON.stringify(state);
    localStorage.setItem(storageKey, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage', err);
  }
};

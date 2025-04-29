
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

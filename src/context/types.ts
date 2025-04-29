
import { VC, Round, Status } from '@/types';

// Define AuthUser type
export interface AuthUser {
  id: string;
  email?: string; // Make email optional to match Supabase User type
  displayName: string | null;
  photoURL: string | null;
}

// Define CRMAction type here to avoid circular imports
export type CRMAction = 
  | { type: 'INITIALIZE_STATE'; payload: CRMState }
  | { type: 'ADD_ROUND'; payload: { name: string; targetAmount?: number; valuationCap?: number } }
  | { type: 'UPDATE_ROUND'; payload: Partial<Round> & { id: string } }
  | { type: 'DELETE_ROUND'; payload: string }
  | { type: 'EXPAND_ROUND'; payload: string }
  | { type: 'COLLAPSE_ROUND'; payload: string }
  | { type: 'TOGGLE_ROUND'; payload: string }
  | { type: 'TOGGLE_ROUND_EXPAND'; payload: string }
  | { type: 'CYCLE_ROUND_VISIBILITY'; payload: string }
  | { type: 'ADD_VC'; payload: { id: string; vc: Omit<VC, 'id'> } }
  | { type: 'UPDATE_VC'; payload: VC }
  | { type: 'DELETE_VC'; payload: string }
  | { type: 'DUPLICATE_VC'; payload: { vcId: string; roundId: string } }
  | { type: 'ADD_VC_TO_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'REMOVE_VC_FROM_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'MOVE_VC_BETWEEN_ROUNDS'; payload: { vcId: string; sourceRoundId: string | null; destRoundId: string | null } }
  | { type: 'SET_SCRATCHPAD_NOTES'; payload: string }
  | { type: 'ADD_MEETING_NOTE'; payload: { vcId: string; note: { id: string; content: string; date: string } } }
  | { type: 'UPDATE_MEETING_NOTE'; payload: { vcId: string; note: { id: string; content: string; date: string } } }
  | { type: 'DELETE_MEETING_NOTE'; payload: { vcId: string; noteId: string } }
  | { type: 'EXPAND_VC'; payload: string }
  | { type: 'COLLAPSE_VC'; payload: string }
  | { type: 'SET_VC_STATUS'; payload: { vcId: string; status: Status } }
  | { type: 'SET_ROUND_VCS'; payload: { roundId: string; vcIds: string[] } }
  | { type: 'REORDER_ROUNDS'; payload: Round[] }
  | { type: 'REORDER_VCS'; payload: { roundId: string; vcIds: string[] } };

export interface CRMState {
  vcs: { [id: string]: VC };
  rounds: Round[];
  unsortedVCs: string[];
  scratchpadNotes: string;
  expandedRoundIds: string[];
  expandedVCIds: string[];
  _dataSource?: string;
}

export interface CRMContextType {
  state: CRMState;
  isReadOnly: boolean;
  isSaving: boolean;
  saveError: string | null;
  retryCount: number;
  manualSave: () => Promise<boolean>;

  // VC actions
  addVC: (vcData: { name: string; email?: string; website?: string; status: Status; purchaseAmount?: number }) => string;
  updateVC: (vcData: VC) => void;
  deleteVC: (id: string) => void;
  duplicateVC: (vcId: string, roundId: string) => void;
  
  // Round actions
  addRound: (roundData: { name: string; targetAmount?: number; valuationCap?: number }) => string;
  updateRound: (roundData: Partial<Round> & { id: string }) => void;
  deleteRound: (id: string) => void;
  
  // Round-VC relationship actions
  addVCToRound: (vcId: string, roundId: string) => void;
  removeVCFromRound: (vcId: string, roundId: string) => void;
  moveVCBetweenRounds: (vcId: string, sourceRoundId: string | null, destRoundId: string | null) => void;
  
  // UI state actions
  setScratchpadNotes: (notes: string) => void;
  expandRound: (roundId: string) => void;
  collapseRound: (roundId: string) => void;
  expandVC: (vcId: string) => void;
  collapseVC: (vcId: string) => void;
  
  // Status actions
  setVCStatus: (vcId: string, status: Status) => void;
  
  // Reordering actions
  setRoundVCs: (roundId: string, vcIds: string[]) => void;
  reorderRounds: (rounds: Round[]) => void;
  reorderVCs: (roundId: string, vcIds: string[]) => void;
  getRoundSummary: (roundId: string) => any;
  
  // Meeting notes actions
  addMeetingNote: (vcId: string, content: string) => void;
  updateMeetingNote: (vcId: string, note: { id: string; content: string; date: string }) => void;
  deleteMeetingNote: (vcId: string, noteId: string) => void;
  
  // Helper actions
  removeRoundIdFromVC: (vcId: string, roundId: string) => void;
  addRoundIdToVC: (vcId: string, roundId: string) => void;
  moveVCToUnsorted: (vcId: string) => void;
  moveVCToRound: (vcId: string, roundId: string) => void;
}

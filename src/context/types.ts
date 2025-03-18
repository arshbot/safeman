import { User } from "@supabase/supabase-js";
import { Round, VC, Status, RoundVisibility } from "@/types";

export interface CRMState {
  rounds: Round[];
  vcs: { [id: string]: VC };
  unsortedVCs: string[];
  isAddRoundModalOpen: boolean;
  isAddVcModalOpen: boolean;
  isEditRoundModalOpen: boolean;
  isEditVcModalOpen: boolean;
  selectedRoundId: string | null;
  selectedVcId: string | null;
  scratchpadNotes?: string; // Added for scratchpad feature
}

export type CRMAction =
  | { type: 'INITIALIZE_STATE'; payload: CRMState }
  | { type: 'ADD_ROUND'; payload: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded' | 'visibility'> & { id: string } }
  | { type: 'UPDATE_ROUND'; payload: Round }
  | { type: 'DELETE_ROUND'; payload: string }
  | { type: 'TOGGLE_ROUND_EXPAND'; payload: string }
  | { type: 'CYCLE_ROUND_VISIBILITY'; payload: string }
  | { type: 'ADD_VC'; payload: { vc: Omit<VC, 'id'>; id: string } }
  | { type: 'UPDATE_VC'; payload: VC }
  | { type: 'DELETE_VC'; payload: string }
  | { type: 'DUPLICATE_VC'; payload: { vcId: string; roundId: string } }
  | { type: 'ADD_VC_TO_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'REMOVE_VC_FROM_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'REORDER_ROUNDS'; payload: Round[] }
  | { type: 'REORDER_VCS'; payload: { roundId: string; vcIds: string[] } }
  | { type: 'OPEN_ADD_ROUND_MODAL' }
  | { type: 'CLOSE_ADD_ROUND_MODAL' }
  | { type: 'OPEN_ADD_VC_MODAL' }
  | { type: 'CLOSE_ADD_VC_MODAL' }
  | { type: 'OPEN_EDIT_ROUND_MODAL'; payload: string }
  | { type: 'CLOSE_EDIT_ROUND_MODAL' }
  | { type: 'OPEN_EDIT_VC_MODAL'; payload: string }
  | { type: 'CLOSE_EDIT_VC_MODAL' }
  | { type: 'ADD_MEETING_NOTE'; payload: { vcId: string; note: { id: string; date: string; content: string } } }
  | { type: 'UPDATE_MEETING_NOTE'; payload: { vcId: string; note: { id: string; date: string; content: string } } }
  | { type: 'DELETE_MEETING_NOTE'; payload: { vcId: string; noteId: string } };

export interface CRMContextType {
  state: CRMState;
  isReadOnly: boolean;
  addRound: (round: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded' | 'visibility'>) => string;
  updateRound: (round: Round) => void;
  deleteRound: (roundId: string) => void;
  toggleRoundExpand: (roundId: string) => void;
  cycleRoundVisibility: (roundId: string) => void;
  addVC: (vc: Omit<VC, 'id'>) => string;
  updateVC: (vc: VC) => void;
  deleteVC: (vcId: string) => void;
  duplicateVC: (vcId: string, roundId: string) => void;
  addVCToRound: (vcId: string, roundId: string) => void;
  removeVCFromRound: (vcId: string, roundId: string) => void;
  reorderRounds: (rounds: Round[]) => void;
  reorderVCs: (roundId: string, vcIds: string[]) => void;
  openAddRoundModal: () => void;
  closeAddRoundModal: () => void;
  openAddVcModal: () => void;
  closeAddVcModal: () => void;
  openEditRoundModal: (roundId: string) => void;
  closeEditRoundModal: () => void;
  openEditVcModal: (vcId: string) => void;
  closeEditVcModal: () => void;
  addMeetingNote: (vcId: string, content: string) => void;
  updateMeetingNote: (vcId: string, note: { id: string; date: string; content: string }) => void;
  deleteMeetingNote: (vcId: string, noteId: string) => void;
  getRoundSummary: (roundId: string) => { 
    totalVCs: number; 
    finalized: number; 
    closeToBuying: number;
    totalCommitted: number;
    isOversubscribed: boolean;
  };
}

export interface AuthUser extends User {
  displayName: string | null;
  photoURL: string | null;
}

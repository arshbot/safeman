import { User } from "@supabase/supabase-js";
import { Round, VC } from "@/types";

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
}

export type CRMAction =
  | { type: 'ADD_ROUND'; payload: Round }
  | { type: 'UPDATE_ROUND'; payload: Round }
  | { type: 'DELETE_ROUND'; payload: string }
  | { type: 'TOGGLE_ROUND_EXPAND'; payload: string }
  | { type: 'CYCLE_ROUND_VISIBILITY'; payload: string }
  | { type: 'ADD_VC'; payload: { vc: VC; id: string } }
  | { type: 'UPDATE_VC'; payload: VC }
  | { type: 'DELETE_VC'; payload: string }
  | { type: 'DUPLICATE_VC'; payload: { vcId: string; roundId: string } }
  | { type: 'ADD_VC_TO_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'REMOVE_VC_FROM_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'OPEN_ADD_ROUND_MODAL' }
  | { type: 'CLOSE_ADD_ROUND_MODAL' }
  | { type: 'OPEN_ADD_VC_MODAL' }
  | { type: 'CLOSE_ADD_VC_MODAL' }
  | { type: 'OPEN_EDIT_ROUND_MODAL'; payload: string }
  | { type: 'CLOSE_EDIT_ROUND_MODAL' }
  | { type: 'OPEN_EDIT_VC_MODAL'; payload: string }
  | { type: 'CLOSE_EDIT_VC_MODAL' }
  | { type: 'ADD_MEETING_NOTE'; payload: { vcId: string; note: MeetingNote } }
  | { type: 'UPDATE_MEETING_NOTE'; payload: { vcId: string; note: MeetingNote } }
  | { type: 'DELETE_MEETING_NOTE'; payload: { vcId: string; noteId: string } };

export interface CRMContextType {
  state: CRMState;
  isReadOnly: boolean;
  addRound: (round: Round) => void;
  updateRound: (round: Round) => void;
  deleteRound: (roundId: string) => void;
  toggleRoundExpand: (roundId: string) => void;
  cycleRoundVisibility: (roundId: string) => void;
  addVC: (vc: VC, id: string) => void;
  updateVC: (vc: VC) => void;
  deleteVC: (vcId: string) => void;
  duplicateVC: (vcId: string, roundId: string) => void;
  addVCToRound: (vcId: string, roundId: string) => void;
  removeVCFromRound: (vcId: string, roundId: string) => void;
  openAddRoundModal: () => void;
  closeAddRoundModal: () => void;
  openAddVcModal: () => void;
  closeAddVcModal: () => void;
  openEditRoundModal: (roundId: string) => void;
  closeEditRoundModal: () => void;
  openEditVcModal: (vcId: string) => void;
  closeEditVcModal: () => void;
  addMeetingNote: (vcId: string, note: MeetingNote) => void;
  updateMeetingNote: (vcId: string, note: MeetingNote) => void;
  deleteMeetingNote: (vcId: string, noteId: string) => void;
}

export interface MeetingNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface AuthUser extends User {
  displayName: string | null;
  photoURL: string | null;
}

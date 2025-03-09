
import { CRMState, Round, VC, Status, MeetingNote } from '@/types';

// Actions
export type CRMAction =
  | { type: 'ADD_ROUND'; payload: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded'> }
  | { type: 'UPDATE_ROUND'; payload: Round }
  | { type: 'DELETE_ROUND'; payload: string }
  | { type: 'ADD_VC'; payload: { vc: Omit<VC, 'id'>; id: string } }
  | { type: 'UPDATE_VC'; payload: VC }
  | { type: 'DELETE_VC'; payload: string }
  | { type: 'DUPLICATE_VC'; payload: { vcId: string; roundId: string } }
  | { type: 'ADD_VC_TO_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'REMOVE_VC_FROM_ROUND'; payload: { vcId: string; roundId: string } }
  | { type: 'TOGGLE_ROUND_EXPAND'; payload: string }
  | { type: 'REORDER_ROUNDS'; payload: Round[] }
  | { type: 'REORDER_VCS'; payload: { roundId: string; vcIds: string[] } }
  | { type: 'ADD_MEETING_NOTE'; payload: { vcId: string; note: MeetingNote } }
  | { type: 'UPDATE_MEETING_NOTE'; payload: { vcId: string; note: MeetingNote } }
  | { type: 'DELETE_MEETING_NOTE'; payload: { vcId: string; noteId: string } };

// Context type
export interface CRMContextType {
  state: CRMState;
  addRound: (round: Omit<Round, 'id' | 'vcs' | 'order' | 'isExpanded'>) => void;
  updateRound: (round: Round) => void;
  deleteRound: (roundId: string) => void;
  addVC: (vc: Omit<VC, 'id'>) => string;
  updateVC: (vc: VC) => void;
  deleteVC: (vcId: string) => void;
  duplicateVC: (vcId: string, roundId: string) => void;
  addVCToRound: (vcId: string, roundId: string) => void;
  removeVCFromRound: (vcId: string, roundId: string) => void;
  toggleRoundExpand: (roundId: string) => void;
  reorderRounds: (rounds: Round[]) => void;
  reorderVCs: (roundId: string, vcIds: string[]) => void;
  getRoundSummary: (roundId: string) => { 
    totalVCs: number; 
    finalized: number; 
    closeToBuying: number;
    totalCommitted: number;
    isOversubscribed: boolean;
  };
  addMeetingNote: (vcId: string, content: string) => void;
  updateMeetingNote: (vcId: string, note: MeetingNote) => void;
  deleteMeetingNote: (vcId: string, noteId: string) => void;
}

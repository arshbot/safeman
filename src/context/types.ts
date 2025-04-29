import { VC, Round, Status } from '@/types';
import { CRMAction } from './reducers';

export interface CRMState {
  vcs: { [id: string]: VC };
  rounds: Round[];
  unsortedVCs: string[];
  scratchpadNotes?: string;
  expandedRoundIds: string[];
  expandedVCIds: string[];
}

export interface CRMContextType {
  state: CRMState;
  isReadOnly: boolean;
  isSaving: boolean;
  saveError: string | null;
  retryCount: number;
  manualSave: () => Promise<boolean>;

  addVC: (vcData: { name: string; email?: string; website?: string; status: Status; purchaseAmount?: number }) => string;
  updateVC: (id: string, updates: Partial<VC>) => void;
  deleteVC: (id: string) => void;
  addVCToRound: (vcId: string, roundId: string) => void;
  removeVCFromRound: (vcId: string, roundId: string) => void;
  addRound: (roundData: { name: string; targetAmount: number }) => string;
  updateRound: (id: string, updates: Partial<Round>) => void;
  deleteRound: (id: string) => void;
  moveVCBetweenRounds: (vcId: string, sourceRoundId: string | null, destRoundId: string | null) => void;
  setScratchpadNotes: (notes: string) => void;
  expandRound: (roundId: string) => void;
  collapseRound: (roundId: string) => void;
  expandVC: (vcId: string) => void;
  collapseVC: (vcId: string) => void;
  setVCStatus: (vcId: string, status: Status) => void;
  setRoundVCs: (roundId: string, vcIds: string[]) => void;
  removeRoundIdFromVC: (vcId: string, roundId: string) => void;
  addRoundIdToVC: (vcId: string, roundId: string) => void;
  moveVCToUnsorted: (vcId: string) => void;
  moveVCToRound: (vcId: string, roundId: string) => void;
}

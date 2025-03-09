
export type Status = 'notContacted' | 'contacted' | 'closeToBuying' | 'finalized';

export interface MeetingNote {
  id: string;
  date: string; // ISO string format
  content: string;
}

export interface VC {
  id: string;
  name: string;
  email?: string;
  website?: string;
  notes?: string;
  status: Status;
  meetingNotes?: MeetingNote[];
  purchaseAmount?: number; // Amount the VC has committed to invest
}

export interface Round {
  id: string;
  name: string;
  valuationCap: number;
  targetAmount: number;
  vcs: string[]; // Array of VC IDs
  order: number;
  isExpanded: boolean;
}

export interface RoundSummary {
  totalVCs: number;
  finalized: number;
  closeToBuying: number;
  totalCommitted: number; // Total amount committed by finalized VCs
  isOversubscribed: boolean; // Flag to indicate if round is oversubscribed
}

export interface CRMState {
  rounds: Round[];
  vcs: Record<string, VC>;
  unsortedVCs: string[]; // Array of VC IDs
}

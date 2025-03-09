
export type Status = 'notContacted' | 'contacted' | 'closeToBuying' | 'sold';

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
  sold: number;
  closeToBuying: number;
}

export interface CRMState {
  rounds: Round[];
  vcs: Record<string, VC>;
  unsortedVCs: string[]; // Array of VC IDs
}

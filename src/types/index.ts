
export interface Round {
  id: string;
  name: string;
  vcs: string[];
  order?: number;
  isExpanded?: boolean;
  visibility?: RoundVisibility;
  targetAmount?: number;
  valuationCap?: number;
}

export interface VC {
  id: string;
  name: string;
  description?: string;
  status?: Status;
  email?: string;
  website?: string;
  purchaseAmount?: number;
  meetingNotes?: MeetingNote[];
}

export type Status = 'notContacted' | 'contacted' | 'closeToBuying' | 'finalized' | 'likelyPassed';

export interface MeetingNote {
  id: string;
  content: string;
  date: string;
}

export type RoundVisibility = 'expanded' | 'collapsedShowFinalized' | 'collapsedHideAll';

export interface RoundSummary {
  totalVCs: number;
  finalized: number;
  closeToBuying: number;
  totalCommitted: number;
  isOversubscribed: boolean;
}

export interface EquityPoint {
  raised: number;
  totalRaised: number;
  equityGranted: number;
  totalEquityGranted: number;
  label: string;
  order: number;
}

export interface CRMState {
  rounds: Round[];
  vcs: Record<string, VC>;
  unsortedVCs: string[];
  scratchpadNotes: string;
  expandedRoundIds: string[];
  expandedVCIds: string[];
  _dataSource?: string; // Property to track data source
}

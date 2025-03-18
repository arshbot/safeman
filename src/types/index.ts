export interface Round {
  id: string;
  name: string;
  vcs: string[];
}

export interface VC {
  id: string;
  name: string;
  description?: string;
}

export interface CRMState {
  rounds: Round[];
  vcs: Record<string, VC>;
  unsortedVCs: string[];
  scratchpadNotes: string;
  _dataSource?: string; // Optional property to track data source
}

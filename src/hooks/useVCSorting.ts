
import { useCRM } from "@/context/CRMContext";

export function useVCSorting() {
  const { state } = useCRM();

  // Sort VCs by status: finalized -> closeToBuying -> others
  const sortVCsByStatus = (vcIds: string[]): string[] => {
    return [...vcIds].sort((aId, bId) => {
      const vcA = state.vcs[aId];
      const vcB = state.vcs[bId];
      
      if (!vcA || !vcB) return 0;
      
      // Finalized VCs come first
      if (vcA.status === 'finalized' && vcB.status !== 'finalized') return -1;
      if (vcA.status !== 'finalized' && vcB.status === 'finalized') return 1;
      
      // Close to buying VCs come second
      if (vcA.status === 'closeToBuying' && vcB.status !== 'closeToBuying') return -1;
      if (vcA.status !== 'closeToBuying' && vcB.status === 'closeToBuying') return 1;
      
      // All other statuses maintain their order
      return 0;
    });
  };

  return { sortVCsByStatus };
}

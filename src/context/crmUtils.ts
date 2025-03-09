
import { CRMState } from '@/types';

export const getRoundSummary = (state: CRMState, roundId: string) => {
  const round = state.rounds.find((r) => r.id === roundId);
  if (!round) {
    return { 
      totalVCs: 0, 
      finalized: 0, 
      closeToBuying: 0,
      totalCommitted: 0,
      isOversubscribed: false
    };
  }

  const vcsInRound = round.vcs
    .map((vcId) => state.vcs[vcId])
    .filter(Boolean);

  const finalizedVCs = vcsInRound.filter((vc) => vc.status === 'finalized');
  const totalCommitted = finalizedVCs.reduce((sum, vc) => sum + (vc.purchaseAmount || 0), 0);
  
  return {
    totalVCs: vcsInRound.length,
    finalized: finalizedVCs.length,
    closeToBuying: vcsInRound.filter((vc) => vc.status === 'closeToBuying').length,
    totalCommitted: totalCommitted,
    isOversubscribed: totalCommitted > round.targetAmount
  };
};

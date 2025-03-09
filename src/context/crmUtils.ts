
import { CRMState } from '@/types';

export const getRoundSummary = (state: CRMState, roundId: string) => {
  const round = state.rounds.find((r) => r.id === roundId);
  if (!round) {
    return { totalVCs: 0, sold: 0, closeToBuying: 0 };
  }

  const vcsInRound = round.vcs
    .map((vcId) => state.vcs[vcId])
    .filter(Boolean);

  return {
    totalVCs: vcsInRound.length,
    sold: vcsInRound.filter((vc) => vc.status === 'sold').length,
    closeToBuying: vcsInRound.filter((vc) => vc.status === 'closeToBuying').length,
  };
};

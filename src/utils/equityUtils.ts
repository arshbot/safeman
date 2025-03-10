
import { CRMState, EquityPoint } from "@/types";

/**
 * Calculate total committed funds across all rounds
 */
export const calculateTotalCommitted = (state: CRMState): number => {
  return Object.values(state.rounds).reduce((sum, round) => {
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    const roundTotal = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0);
    return sum + roundTotal;
  }, 0);
};

/**
 * Generate equity data points with completely separate lines for actual and target values
 */
export const generateEquityData = (state: CRMState): { 
  actualEquityPoints: EquityPoint[],
  targetEquityPoints: EquityPoint[] 
} => {
  // Sort rounds by their order
  const sortedRounds = [...state.rounds].sort((a, b) => a.order - b.order);
  
  let actualPoints: EquityPoint[] = [];
  let targetPoints: EquityPoint[] = [];
  
  let cumulativeActualEquity = 0;
  let cumulativeTargetEquity = 0;
  
  // Process each round
  sortedRounds.forEach(round => {
    // Calculate target amount and equity for this round
    const targetRaised = round.targetAmount / 1000; // Convert to thousands (for K display)
    const targetValuation = round.valuationCap;
    const targetEquityGranted = targetValuation > 0 
      ? (round.targetAmount / targetValuation) * 100
      : 0;
    
    // Add to cumulative target equity
    cumulativeTargetEquity += targetEquityGranted;
    
    // Add target data point (always add target point if it has a value)
    if (targetRaised > 0) {
      targetPoints.push({
        raised: targetRaised,
        totalRaised: targetRaised, // X-axis value is the target amount itself
        equityGranted: targetEquityGranted,
        totalEquityGranted: cumulativeTargetEquity,
        label: round.name,
        order: round.order
      });
    }
    
    // Get finalized VCs for this round
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    // Only add actual data point if there are finalized VCs with purchase amounts
    if (roundVCs.length > 0) {
      const actualRaised = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0) / 1000;
      const actualValuation = round.valuationCap;
      const actualEquityGranted = actualValuation > 0
        ? (roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0) / actualValuation) * 100
        : 0;
      
      cumulativeActualEquity += actualEquityGranted;
      
      actualPoints.push({
        raised: actualRaised,
        totalRaised: actualRaised, // X-axis value is the actual amount raised
        equityGranted: actualEquityGranted,
        totalEquityGranted: cumulativeActualEquity,
        label: round.name,
        order: round.order
      });
    }
  });
  
  return {
    actualEquityPoints: actualPoints,
    targetEquityPoints: targetPoints
  };
};

/**
 * Create logarithmic tick values with better spread for the x-axis
 */
export const createLogTicks = (maxValue: number): number[] => {
  // Start with 100K
  const ticks = [100];
  
  // Add additional logarithmic points
  if (maxValue >= 160) ticks.push(160);
  if (maxValue >= 200) ticks.push(200);
  if (maxValue >= 500) ticks.push(500);
  if (maxValue >= 1000) ticks.push(1000);
  if (maxValue >= 2000) ticks.push(2000);
  if (maxValue >= 5000) ticks.push(5000);
  if (maxValue >= 10000) ticks.push(10000);
  
  return ticks;
};

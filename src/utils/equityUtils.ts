
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
  
  let cumulativeActualRaised = 0;
  let cumulativeActualEquity = 0;
  
  let cumulativeTargetRaised = 0;
  let cumulativeTargetEquity = 0;
  
  // Process each round
  sortedRounds.forEach(round => {
    // Calculate target amount and equity
    const targetRaised = round.targetAmount / 1000000; // Convert to millions
    const targetValuation = round.valuationCap > 0 ? round.valuationCap : 10000000; // Default to $10M if no valuation cap
    const targetEquityGranted = (round.targetAmount / targetValuation) * 100;
    
    // Add to cumulative targets
    cumulativeTargetRaised += targetRaised;
    cumulativeTargetEquity += targetEquityGranted;
    
    // Add target data point
    targetPoints.push({
      raised: targetRaised,
      totalRaised: Math.max(cumulativeTargetRaised, 0.1), // Ensure minimum value for log scale
      equityGranted: targetEquityGranted,
      totalEquityGranted: cumulativeTargetEquity,
      label: round.name,
      order: round.order
    });
    
    // Get finalized VCs for this round
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    // Only add actual data point if there are finalized VCs with purchase amounts
    if (roundVCs.length > 0) {
      const actualRaised = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0) / 1000000;
      const actualValuation = round.valuationCap > 0 ? round.valuationCap : 10000000;
      const actualEquityGranted = (roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0) / actualValuation) * 100;
      
      cumulativeActualRaised += actualRaised;
      cumulativeActualEquity += actualEquityGranted;
      
      actualPoints.push({
        raised: actualRaised,
        totalRaised: Math.max(cumulativeActualRaised, 0.1), // Ensure minimum value for log scale
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
  // Start with our minimum value for log scale
  const ticks = [0.1];
  
  // Add additional values between 0.1 and 1
  if (maxValue >= 0.5) ticks.push(0.5);
  if (maxValue >= 1) ticks.push(1);
  
  // Add values from 2 to max, making sure we have a nice spread
  if (maxValue >= 2) ticks.push(2);
  if (maxValue >= 5) ticks.push(5);
  if (maxValue >= 10) ticks.push(10);
  if (maxValue >= 20) ticks.push(20);
  if (maxValue >= 50) ticks.push(50);
  if (maxValue >= 100) ticks.push(100);
  
  return ticks;
};

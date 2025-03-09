
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
 * Generate equity data points based on actual rounds
 */
export const generateEquityData = (state: CRMState): EquityPoint[] => {
  const equityData: EquityPoint[] = [];
  
  // Sort rounds by their order, but in reverse (highest order first)
  const sortedRounds = [...state.rounds].sort((a, b) => b.order - a.order);
  
  let cumulativeRaised = 0;
  let cumulativeEquity = 0;
  let cumulativeTargetRaised = 0;
  let cumulativeTargetEquity = 0;
  
  // For each round, calculate how much was raised and how much equity was granted
  sortedRounds.forEach(round => {
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    // Calculate target amount in millions and target equity percentage
    const targetRaised = round.targetAmount / 1000000; // Convert to millions
    
    // Fixed target equity calculation based on target amount and valuation cap
    const effectiveValuation = round.valuationCap > 0 ? round.valuationCap : 10000000; // Default to $10M if no valuation cap
    const targetEquityGranted = (round.targetAmount / effectiveValuation) * 100;
    
    // Add to cumulative targets
    cumulativeTargetRaised += targetRaised;
    cumulativeTargetEquity += targetEquityGranted;
    
    // Skip adding equity data point if there are no finalized VCs in this round
    if (roundVCs.length === 0) {
      // Still add the round to the target raised line
      equityData.push({
        raised: 0,
        totalRaised: Math.max(cumulativeRaised, 0.1), // Ensure minimum value for log scale
        equityGranted: 0,
        totalEquityGranted: cumulativeEquity,
        targetRaised: targetRaised,
        totalTargetRaised: Math.max(cumulativeTargetRaised, 0.1), // Ensure minimum value for log scale
        targetEquityGranted: targetEquityGranted,
        totalTargetEquityGranted: cumulativeTargetEquity,
        label: round.name,
        order: round.order
      });
      
      return; // Skip the rest for this round
    }
    
    const roundRaised = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0) / 1000000; // Convert to millions
    
    // Fixed equity calculation based on purchase amount and valuation cap
    const effectiveValuation = round.valuationCap > 0 ? round.valuationCap : 10000000; // Default to $10M if no valuation cap
    
    // Calculate equity percentage more accurately - if round raised money, equity is based on amount raised
    // Equity percentage = (amount raised / valuation cap) * 100
    const equityGranted = (roundRaised * 1000000) / effectiveValuation * 100;
    
    cumulativeRaised += roundRaised;
    cumulativeEquity += equityGranted;
    
    // Add points for all rounds (even if they haven't raised money yet)
    equityData.push({
      raised: roundRaised,
      totalRaised: Math.max(cumulativeRaised, 0.1), // Ensure minimum value for log scale
      equityGranted: equityGranted,
      totalEquityGranted: cumulativeEquity,
      targetRaised: targetRaised,
      totalTargetRaised: Math.max(cumulativeTargetRaised, 0.1), // Ensure minimum value for log scale
      targetEquityGranted: targetEquityGranted,
      totalTargetEquityGranted: cumulativeTargetEquity,
      label: round.name,
      order: round.order
    });
  });
  
  // Sort the equity data points by their order, lowest first (early rounds first)
  return equityData.sort((a, b) => a.order - b.order);
};

/**
 * Create logarithmic tick values with better spread for the x-axis
 */
export const createLogTicks = (equityData: EquityPoint[]): number[] => {
  const maxValue = Math.max(...equityData.map(d => d.totalRaised), 10); // Ensure at least 10M for scale
  
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

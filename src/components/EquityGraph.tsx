
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/context/CRMContext';
import { EquityLineChart } from './equity/EquityLineChart';
import { EquitySummary } from './equity/EquitySummary';
import { calculateTotalCommitted, generateEquityData } from '@/utils/equityUtils';

export function EquityGraph() {
  const { state } = useCRM();
  
  // Calculate total committed across all rounds
  const totalCommitted = calculateTotalCommitted(state);

  // Generate equity data points with separate actual and target data
  const { actualEquityPoints, targetEquityPoints } = generateEquityData(state);
  
  // Calculate total founder equity based ONLY on actual equity granted (not targets)
  const totalEquityGranted = actualEquityPoints.reduce(
    (total, point) => total + point.equityGranted, 
    0
  );
  const founderEquity = 100 - totalEquityGranted;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-left">Total Equity Granted vs. Total Raised</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart with fixed height */}
        <div className="h-[550px]">
          <EquityLineChart 
            actualEquityPoints={actualEquityPoints} 
            targetEquityPoints={targetEquityPoints}
          />
        </div>
        
        <EquitySummary 
          founderEquity={founderEquity}
          totalCommitted={totalCommitted}
          roundsCount={state.rounds.length}
        />
      </CardContent>
    </Card>
  );
}

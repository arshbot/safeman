
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

  // Generate equity data points based on actual rounds
  const equityData = generateEquityData(state);
  
  // Calculate total founder equity by taking 100 and subtracting the sum of equity granted in each round
  const totalEquityGranted = equityData.reduce((total, point) => total + point.equityGranted, 0);
  const founderEquity = Math.max(0, 100 - totalEquityGranted);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-left">Total Equity Granted vs. Total Raised</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart with fixed height */}
        <div className="h-[550px]">
          <EquityLineChart equityData={equityData} />
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

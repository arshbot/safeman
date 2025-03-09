
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
  
  // Calculate founder equity
  const founderEquity = 100 - (equityData.length > 0 ? equityData[equityData.length - 1].totalEquityGranted : 0);

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

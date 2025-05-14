
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/context/CRMContext';
import { EquityLineChart } from './equity/EquityLineChart';
import { EquitySummary } from './equity/EquitySummary';
import { calculateTotalCommitted, generateEquityData } from '@/utils/equityUtils';

export function EquityGraph() {
  const { state } = useCRM();
  
  // Calculate total committed across all rounds
  const totalCommitted = calculateTotalCommitted(state as any);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-left">Total Funding Raised</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart with fixed height */}
        <div className="h-[550px]">
          <EquityLineChart 
            totalCommitted={totalCommitted}
            rounds={state.rounds}
          />
        </div>
        
        <EquitySummary 
          totalCommitted={totalCommitted}
          roundsCount={state.rounds.length}
        />
      </CardContent>
    </Card>
  );
}

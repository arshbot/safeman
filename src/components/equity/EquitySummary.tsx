
import React from 'react';
import { formatCurrency } from '@/utils/formatters';

interface EquitySummaryProps {
  totalCommitted: number;
  roundsCount: number;
}

export function EquitySummary({ totalCommitted, roundsCount }: EquitySummaryProps) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mt-8">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-left">Total Raised</h3>
          <p className="text-3xl font-semibold text-left">
            {formatCurrency(totalCommitted)}
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-left">Funding Rounds</h3>
          <p className="text-3xl font-semibold text-left">{roundsCount}</p>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { EquityPoint } from '@/types';
import { formatPercentage, formatCurrency } from '@/utils/formatters';

interface EquityChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function EquityChartTooltip({ active, payload }: EquityChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as EquityPoint & { dataType: 'actual' | 'target' };
  const isActual = data.dataType === 'actual';

  return (
    <div className="bg-white p-3 border rounded shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-sm text-gray-700">
        {isActual ? 'Actual Raised: ' : 'Target: '}
        {formatCurrency(data.raised * 1000)}
      </p>
      <p className="text-sm text-gray-700">
        {isActual ? 'Equity Granted: ' : 'Target Equity: '}
        {formatPercentage(data.equityGranted)}
      </p>
      <p className="text-sm font-medium text-gray-800">
        {isActual ? 'Total Equity: ' : 'Total Target Equity: '}
        {formatPercentage(data.totalEquityGranted)}
      </p>
    </div>
  );
}

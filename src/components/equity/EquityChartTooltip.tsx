
import React from 'react';
import { EquityPoint } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface EquityChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function EquityChartTooltip({ active, payload }: EquityChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as EquityPoint;

  return (
    <div className="bg-white p-3 border rounded shadow-md">
      <p className="font-medium">{data.label}</p>
      <p className="text-sm text-gray-600">Target: {formatCurrency(data.targetRaised * 1000000)}</p>
    </div>
  );
}


import React from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { EquityPoint } from '@/types';

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
      <p>Raised: {formatCurrency(data.raised)}</p>
      <p>Total Raised: {formatCurrency(data.totalRaised)}</p>
      <p>Target for Round: {formatCurrency(data.targetRaised)}</p>
      <p>Total Target: {formatCurrency(data.totalTargetRaised)}</p>
      <p>Equity Granted: {formatPercentage(data.equityGranted)}</p>
      <p>Total Equity Granted: {formatPercentage(data.totalEquityGranted)}</p>
      <p>Target Equity Granted: {formatPercentage(data.targetEquityGranted)}</p>
      <p>Total Target Equity: {formatPercentage(data.totalTargetEquityGranted)}</p>
      <p>Founder Equity: {formatPercentage(100 - data.totalEquityGranted)}</p>
    </div>
  );
}

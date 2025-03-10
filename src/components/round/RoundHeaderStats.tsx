
import { RoundSummary } from '@/types';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RoundHeaderStatsProps {
  name: string;
  summary: RoundSummary;
  targetAmount: number;
  valuationCap: number;
  raisedAmount: number;
  equityPercentage: number;
  formatCurrency: (amount: number) => string;
}

export function RoundHeaderStats({ 
  name, 
  summary, 
  targetAmount, 
  valuationCap,
  raisedAmount,
  equityPercentage,
  formatCurrency 
}: RoundHeaderStatsProps) {
  return (
    <div className="flex-1">
      <div className="font-semibold text-lg flex items-center">
        {/* Removed the duplicate round name */}
        
        {/* Warning indicator for oversubscribed rounds */}
        {summary.isOversubscribed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>This round is oversubscribed! Total committed: {formatCurrency(summary.totalCommitted)} exceeds target: {formatCurrency(targetAmount)}.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex text-sm text-gray-500 space-x-4">
        <span>Target: {formatCurrency(targetAmount)}</span>
        <span>Cap: {formatCurrency(valuationCap)}</span>
        <span>VCs: {summary.totalVCs}</span>
        <span className="text-status-sold">Finalized: {summary.finalized}</span>
        <span className="text-status-closeToBuying">Close: {summary.closeToBuying}</span>
        {summary.totalCommitted > 0 && (
          <span className={`font-medium ${summary.isOversubscribed ? 'text-red-500' : 'text-emerald-600'}`}>
            Committed: {formatCurrency(summary.totalCommitted)}
          </span>
        )}
        {raisedAmount > 0 && (
          <span className="font-medium text-purple-600">
            Equity Granted: {equityPercentage.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}

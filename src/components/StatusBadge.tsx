
import { Status } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  notContacted: {
    label: 'Not Contacted',
    className: 'bg-status-notContacted text-muted-foreground',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-status-contacted text-white',
  },
  closeToBuying: {
    label: 'Close to Buying',
    className: 'bg-status-closeToBuying text-white',
  },
  finalized: {
    label: 'Finalized',
    className: 'bg-status-sold text-white',
  },
  likelyPassed: {
    label: 'Likely Passed',
    className: 'bg-red-200 text-red-800',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Check if the status exists in the config, provide a fallback if not
  const config = statusConfig[status] || { 
    label: status, 
    className: 'bg-gray-300 text-gray-700'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

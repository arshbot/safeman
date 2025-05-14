
import { Status } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showDescription?: boolean;
}

const statusConfig: Record<Status, { label: string; className: string; description: string }> = {
  notContacted: {
    label: 'Not Contacted',
    className: 'bg-status-notContacted text-muted-foreground',
    description: 'You have not reached out to this VC yet',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-status-contacted text-white',
    description: 'Initial contact has been made with this VC',
  },
  closeToBuying: {
    label: 'Close to Buying',
    className: 'bg-status-closeToBuying text-white',
    description: 'VC has expressed serious interest in investing',
  },
  finalized: {
    label: 'Finalized',
    className: 'bg-status-sold text-white',
    description: 'Investment has been confirmed and finalized',
  },
  likelyPassed: {
    label: 'Likely Passed',
    className: 'bg-red-200 text-red-800',
    description: 'VC has indicated they are unlikely to invest',
  },
  banished: {
    label: 'Banished',
    className: 'bg-black text-white',
    description: 'This VC has been banished',
  },
};

export function StatusBadge({ status, className, showDescription = false }: StatusBadgeProps) {
  // Check if the status exists in the config, provide a fallback if not
  const config = statusConfig[status] || { 
    label: status, 
    className: 'bg-gray-300 text-gray-700',
    description: 'Unknown status',
  };

  return (
    <div className="flex flex-col">
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all',
          config.className,
          className
        )}
      >
        {config.label}
      </span>
      {showDescription && (
        <span className="text-xs text-muted-foreground mt-1">
          {config.description}
        </span>
      )}
    </div>
  );
}

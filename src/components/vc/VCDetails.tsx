
import { ExternalLink } from 'lucide-react';
import { VC } from '@/types';
import { formatNumberWithCommas } from '@/utils/formatters';

interface VCDetailsProps {
  vc: VC;
}

export function VCDetails({ vc }: VCDetailsProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center">
        <h4 className="font-medium">{vc.name}</h4>
        {vc.website && (
          <a 
            href={vc.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-gray-500 hover:text-primary inline-flex items-center"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="text-sm text-gray-600">
        {vc.email && <div>{vc.email}</div>}
        {vc.status === 'finalized' && vc.purchaseAmount !== undefined && (
          <div className="font-medium text-emerald-600">${formatNumberWithCommas(vc.purchaseAmount)}</div>
        )}
      </div>
    </div>
  );
}

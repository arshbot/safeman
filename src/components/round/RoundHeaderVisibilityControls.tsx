
import { RoundVisibility } from '@/types';
import { ChevronDown, ChevronRight, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RoundHeaderVisibilityControlsProps {
  visibility: RoundVisibility;
  onClick: (e: React.MouseEvent) => void;
}

export function RoundHeaderVisibilityControls({ visibility, onClick }: RoundHeaderVisibilityControlsProps) {
  const getVisibilityIcon = (visibility: RoundVisibility) => {
    switch (visibility) {
      case 'expanded':
        return <ChevronDown className="h-5 w-5 text-gray-500" />;
      case 'collapsedShowFinalized':
        return <ChevronRight className="h-5 w-5 text-gray-500" />;
      case 'collapsedHideAll':
        return <EyeOff className="h-5 w-5 text-gray-500" />;
      default:
        return <ChevronDown className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVisibilityTooltip = (visibility: RoundVisibility) => {
    switch (visibility) {
      case 'expanded':
        return "Showing all VCs";
      case 'collapsedShowFinalized':
        return "Showing only finalized and close to buying VCs";
      case 'collapsedHideAll':
        return "Hiding all VCs";
      default:
        return "Click to change visibility";
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mr-2 cursor-pointer" onClick={onClick}>
            {getVisibilityIcon(visibility)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getVisibilityTooltip(visibility)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

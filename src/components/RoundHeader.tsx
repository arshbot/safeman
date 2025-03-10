
import React from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { Round, RoundSummary } from '@/types';
import { Button } from './ui/button';
import { CircleCheck, CircleDashed, PlusCircle, GripVertical } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { RoundHeaderStats } from './round/RoundHeaderStats';
import { RoundHeaderVisibilityControls } from './round/RoundHeaderVisibilityControls';
import { RoundHeaderEditDialog } from './round/RoundHeaderEditDialog';
import { RoundHeaderDeleteDialog } from './round/RoundHeaderDeleteDialog';

interface RoundHeaderProps {
  round: Round;
  summary: RoundSummary;
  onAddVC: (roundId: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

export function RoundHeader({ round, summary, onAddVC, dragHandleProps }: RoundHeaderProps) {
  const handleAddVC = () => {
    onAddVC(round.id);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <GripVertical className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <h3 className="text-lg font-semibold">{round.name}</h3>
          <RoundHeaderEditDialog round={round} />
          <RoundHeaderDeleteDialog roundId={round.id} roundName={round.name} />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddVC}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add VC
          </Button>
          <RoundHeaderVisibilityControls round={round} />
        </div>
      </div>
      
      <RoundHeaderStats round={round} summary={summary} />
    </div>
  );
}

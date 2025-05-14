import React, { useState } from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { Round, RoundSummary } from '@/types';
import { Button } from './ui/button';
import { CircleCheck, CircleDashed, PlusCircle, GripVertical, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { RoundHeaderStats } from './round/RoundHeaderStats';
import { RoundHeaderVisibilityControls } from './round/RoundHeaderVisibilityControls';
import { RoundHeaderEditDialog } from './round/RoundHeaderEditDialog';
import { RoundHeaderDeleteDialog } from './round/RoundHeaderDeleteDialog';
import { useCRM } from '@/context/CRMContext';

interface RoundHeaderProps {
  round: Round;
  summary: RoundSummary;
  onAddVC: (roundId: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

export function RoundHeader({ round, summary, onAddVC, dragHandleProps }: RoundHeaderProps) {
  const { updateRound, deleteRound } = useCRM();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddVC = () => {
    onAddVC(round.id);
  };

  const handleEditRound = (updatedRound: Round) => {
    updateRound(updatedRound);
    setIsEditDialogOpen(false);
  };

  const handleDeleteRound = () => {
    deleteRound(round.id);
    setIsDeleteDialogOpen(false);
  };

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Cycle through visibility states
    const nextVisibility = (() => {
      switch (round.visibility) {
        case 'expanded':
          return 'collapsedShowFinalized';
        case 'collapsedShowFinalized':
          return 'collapsedHideAll';
        case 'collapsedHideAll':
          return 'expanded';
        default:
          return 'expanded';
      }
    })();
    
    updateRound({
      ...round,
      visibility: nextVisibility,
      id: round.id // Ensure id is included
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded">
              <GripVertical className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <h3 className="text-lg font-semibold">{round.name}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditDialogOpen(true)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Edit</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.33168 11.3754 6.42164 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42161 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42161 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Delete</span>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddVC}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add VC
          </Button>
          <RoundHeaderVisibilityControls 
            visibility={round.visibility} 
            onClick={handleVisibilityClick} 
          />
        </div>
      </div>
      
      <RoundHeaderStats 
        name={round.name}
        summary={summary}
        targetAmount={round.targetAmount}
        valuationCap={round.valuationCap}
        raisedAmount={summary.totalCommitted}
        formatCurrency={formatCurrency}
      />

      {/* Edit Dialog */}
      <RoundHeaderEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        round={round}
        onSave={handleEditRound}
      />

      {/* Delete Dialog */}
      <RoundHeaderDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        roundName={round.name}
        onDelete={handleDeleteRound}
      />
    </div>
  );
}

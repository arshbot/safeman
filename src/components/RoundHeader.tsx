
import { Round, RoundSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { toast } from 'sonner';
import { AddVCModal } from './AddVCModal';
import { TooltipProvider } from './ui/tooltip';
import { RoundHeaderDeleteDialog } from './round/RoundHeaderDeleteDialog';
import { RoundHeaderEditDialog } from './round/RoundHeaderEditDialog';
import { RoundHeaderVisibilityControls } from './round/RoundHeaderVisibilityControls';
import { RoundHeaderStats } from './round/RoundHeaderStats';

interface RoundHeaderProps {
  round: Round;
  summary: RoundSummary;
  onAddVC: (roundId: string) => void;
}

export function RoundHeader({ round, summary, onAddVC }: RoundHeaderProps) {
  const { cycleRoundVisibility, updateRound, deleteRound, state } = useCRM();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);

  // Calculate equity granted for this round
  const calculateEquityGranted = () => {
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    const roundRaised = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0);
    
    // Calculate equity percentage based on valuation cap
    const equityPercentage = round.valuationCap > 0 
      ? (roundRaised / round.valuationCap) * 100 
      : 0;
    
    return {
      equityPercentage,
      raisedAmount: roundRaised
    };
  };

  const { equityPercentage, raisedAmount } = calculateEquityGranted();

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    cycleRoundVisibility(round.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleAddVCClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddVCModalOpen(true);
    onAddVC(round.id);
  };

  const handleEditSubmit = (editedRound: Round) => {
    updateRound(editedRound);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    deleteRound(round.id);
    setIsDeleteDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    // For values less than 1 million but greater than or equal to 1000
    if (amount >= 1000 && amount < 1000000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    // For values less than 1000 but greater than 0
    else if (amount < 1000 && amount > 0) {
      return `$${amount.toFixed(0)}`;
    }
    // For values greater than or equal to 1 million
    else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    // Default case for zero or negative values
    return `$0`;
  };

  return (
    <TooltipProvider>
      <div 
        className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2 cursor-pointer hover:bg-gray-50 transition-all scale-on-hover"
        onClick={handleToggleVisibility}
      >
        <div className="flex-1 flex items-center">
          <RoundHeaderVisibilityControls 
            visibility={round.visibility} 
            onClick={handleToggleVisibility} 
          />
          
          <RoundHeaderStats 
            name={round.name}
            summary={summary}
            targetAmount={round.targetAmount}
            valuationCap={round.valuationCap}
            raisedAmount={raisedAmount}
            equityPercentage={equityPercentage}
            formatCurrency={formatCurrency}
          />
        </div>
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddVCClick}
            title="Add VC"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
            title="Edit round"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            title="Delete round"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add VC Modal */}
      <AddVCModal
        open={isAddVCModalOpen}
        onOpenChange={setIsAddVCModalOpen}
        roundId={round.id}
        trigger={null}
      />

      {/* Edit Round Dialog */}
      <RoundHeaderEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        round={round}
        onSave={handleEditSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <RoundHeaderDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        roundName={round.name}
        onDelete={handleDelete}
      />
    </TooltipProvider>
  );
}


import { Round, RoundSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';

interface RoundHeaderProps {
  round: Round;
  summary: RoundSummary;
  onAddVC: (roundId: string) => void;
}

export function RoundHeader({ round, summary, onAddVC }: RoundHeaderProps) {
  const { toggleRoundExpand, updateRound, deleteRound } = useCRM();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedRound, setEditedRound] = useState<Round>(round);
  const [valuationCapFormatted, setValuationCapFormatted] = useState(formatNumberWithCommas(round.valuationCap));
  const [targetAmountFormatted, setTargetAmountFormatted] = useState(formatNumberWithCommas(round.targetAmount));

  const handleToggleExpand = () => {
    toggleRoundExpand(round.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedRound(round);
    setValuationCapFormatted(formatNumberWithCommas(round.valuationCap));
    setTargetAmountFormatted(formatNumberWithCommas(round.targetAmount));
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleAddVCClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddVC(round.id);
  };

  const handleValuationCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setValuationCapFormatted(formatNumberWithCommas(numericValue));
    setEditedRound({
      ...editedRound,
      valuationCap: numericValue
    });
  };

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setTargetAmountFormatted(formatNumberWithCommas(numericValue));
    setEditedRound({
      ...editedRound,
      targetAmount: numericValue
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRound(editedRound);
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    deleteRound(round.id);
    setIsDeleteDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <>
      <div 
        className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2 cursor-pointer hover:bg-gray-50 transition-all scale-on-hover"
        onClick={handleToggleExpand}
      >
        <div className="flex-1 flex items-center">
          <div className="mr-2">
            {round.isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{round.name}</h3>
            <div className="flex text-sm text-gray-500 space-x-4">
              <span>Target: {formatCurrency(round.targetAmount)}</span>
              <span>Cap: {formatCurrency(round.valuationCap)}</span>
              <span>VCs: {summary.totalVCs}</span>
              <span className="text-status-sold">Sold: {summary.sold}</span>
              <span className="text-status-closeToBuying">Close: {summary.closeToBuying}</span>
            </div>
          </div>
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

      {/* Edit Round Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glassmorphism">
          <DialogHeader>
            <DialogTitle>Edit Round</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Round Name</Label>
                <Input
                  id="name"
                  value={editedRound.name}
                  onChange={(e) => setEditedRound({ ...editedRound, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valuationCap">Valuation Cap ($)</Label>
                <Input
                  id="valuationCap"
                  value={valuationCapFormatted}
                  onChange={handleValuationCapChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  value={targetAmountFormatted}
                  onChange={handleTargetAmountChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glassmorphism">
          <DialogHeader>
            <DialogTitle>Delete Round</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete the "{round.name}" round? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

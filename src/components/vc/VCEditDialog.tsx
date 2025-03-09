import { VC, Status } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';
import { useState, useEffect } from 'react';

interface VCEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editedVC: VC;
  setEditedVC: (vc: VC) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  handleRemoveFromRound: () => void;
  roundId?: string;
}

export function VCEditDialog({
  isOpen,
  onOpenChange,
  editedVC,
  setEditedVC,
  handleEditSubmit,
  handleRemoveFromRound,
  roundId,
}: VCEditDialogProps) {
  const statusOptions: Status[] = ['notContacted', 'contacted', 'closeToBuying', 'finalized'];
  const [purchaseAmountFormatted, setPurchaseAmountFormatted] = useState(
    editedVC.purchaseAmount ? formatNumberWithCommas(editedVC.purchaseAmount) : ''
  );

  // Update formatted purchase amount when editedVC changes
  useEffect(() => {
    setPurchaseAmountFormatted(
      editedVC.purchaseAmount ? formatNumberWithCommas(editedVC.purchaseAmount) : ''
    );
  }, [editedVC.purchaseAmount]);

  const handlePurchaseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setPurchaseAmountFormatted(formatNumberWithCommas(numericValue));
    setEditedVC({
      ...editedVC,
      purchaseAmount: numericValue || undefined
    });
  };

  const handleStatusChange = (value: Status) => {
    // If changing to finalized, ensure purchaseAmount has a default value if not set
    if (value === 'finalized' && !editedVC.purchaseAmount) {
      setEditedVC({ 
        ...editedVC, 
        status: value,
        purchaseAmount: 0 
      });
      setPurchaseAmountFormatted('0');
    } else if (value !== 'finalized') {
      // If changing away from finalized, we keep the purchase amount for reference
      setEditedVC({ ...editedVC, status: value });
    } else {
      setEditedVC({ ...editedVC, status: value });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Ensure we keep meetingNotes when updating notes
    setEditedVC({
      ...editedVC,
      notes: e.target.value || undefined
    });
  };

  // Form validation for required purchase amount with finalized status
  const isFormValid = editedVC.status !== 'finalized' || 
    (editedVC.status === 'finalized' && editedVC.purchaseAmount !== undefined);

  // Debug
  console.log("VCEditDialog - Current edited VC:", editedVC);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Edit VC</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedVC.name}
                onChange={(e) => setEditedVC({ ...editedVC, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={editedVC.email || ''}
                onChange={(e) => setEditedVC({ ...editedVC, email: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={editedVC.website || ''}
                onChange={(e) => setEditedVC({ ...editedVC, website: e.target.value || undefined })}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editedVC.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center">
                        <StatusBadge status={status} className="mr-2" />
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Purchase Amount field that shows only when status is finalized */}
            {editedVC.status === 'finalized' && (
              <div className="grid gap-2">
                <Label htmlFor="purchaseAmount">
                  Purchase Amount ($) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="purchaseAmount"
                  value={purchaseAmountFormatted}
                  onChange={handlePurchaseAmountChange}
                  required
                  placeholder="e.g. 100,000"
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={editedVC.notes || ''}
                onChange={handleNotesChange}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            {roundId && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleRemoveFromRound}
                className="mr-auto"
              >
                Remove from Round
              </Button>
            )}
            <Button type="submit" disabled={!isFormValid}>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

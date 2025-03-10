
import { Round } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';

interface RoundHeaderEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  round: Round;
  onSave: (round: Round) => void;
}

export function RoundHeaderEditDialog({
  isOpen,
  onOpenChange,
  round,
  onSave
}: RoundHeaderEditDialogProps) {
  const [editedRound, setEditedRound] = useState<Round>(round);
  const [valuationCapFormatted, setValuationCapFormatted] = useState(
    formatNumberWithCommas(round.valuationCap)
  );
  const [targetAmountFormatted, setTargetAmountFormatted] = useState(
    formatNumberWithCommas(round.targetAmount)
  );
  
  // Update form values when round changes
  useEffect(() => {
    setEditedRound(round);
    setValuationCapFormatted(formatNumberWithCommas(round.valuationCap));
    setTargetAmountFormatted(formatNumberWithCommas(round.targetAmount));
  }, [round]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedRound);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Edit Round</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
  );
}

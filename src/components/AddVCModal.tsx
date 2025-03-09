
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useCRM } from "@/context/CRMContext";
import { Status } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/formatters";

interface AddVCModalProps {
  trigger?: React.ReactNode;
  roundId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVCModal({ trigger, roundId, open, onOpenChange }: AddVCModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("notContacted");
  const [purchaseAmount, setPurchaseAmount] = useState<number | undefined>(undefined);
  const [purchaseAmountFormatted, setPurchaseAmountFormatted] = useState("");
  const { addVC, addVCToRound } = useCRM();

  const statusOptions: Status[] = ['notContacted', 'contacted', 'closeToBuying', 'finalized'];

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!open) {
      // Reset form state on close
      setName("");
      setEmail("");
      setWebsite("");
      setNotes("");
      setStatus("notContacted");
      setPurchaseAmount(undefined);
      setPurchaseAmountFormatted("");
    }
  }, [open]);

  const handleStatusChange = (value: Status) => {
    setStatus(value);
    if (value === 'finalized' && !purchaseAmount) {
      setPurchaseAmount(0);
      setPurchaseAmountFormatted("0");
    }
  };

  const handlePurchaseAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setPurchaseAmount(numericValue);
    setPurchaseAmountFormatted(formatNumberWithCommas(numericValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVC = {
      name,
      email: email || undefined,
      website: website || undefined,
      notes: notes || undefined,
      status,
      purchaseAmount: status === 'finalized' ? purchaseAmount : undefined,
    };
    
    // First close the modal to avoid DnD context issues
    onOpenChange(false);
    
    // Small delay to ensure modal is completely closed before state updates
    setTimeout(() => {
      // Add the VC to get its ID
      const newVCId = addVC(newVC);
      
      // If roundId is provided, add the VC to that round
      if (roundId && newVCId) {
        addVCToRound(newVCId, roundId);
      }
    }, 50);
  };

  // Form validation for required purchase amount with finalized status
  const isFormValid = status !== 'finalized' || 
    (status === 'finalized' && purchaseAmount !== undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Add New VC</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in the details to add a new VC to your database.
            {roundId ? ` This VC will be added to the round directly.` : ''}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VC Name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
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
            {status === 'finalized' && (
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
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isFormValid}>
              {roundId ? "Add to Round" : "Add VC"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCRM } from "@/context/CRMContext";

interface AddRoundModalProps {
  trigger?: React.ReactNode;
}

export function AddRoundModal({ trigger }: AddRoundModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [valuationCap, setValuationCap] = useState(1000000);
  const [targetAmount, setTargetAmount] = useState(500000);
  const { addRound } = useCRM();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRound({
      name,
      valuationCap,
      targetAmount,
    });
    // Reset form
    setName("");
    setValuationCap(1000000);
    setTargetAmount(500000);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Round</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glassmorphism">
        <DialogHeader>
          <DialogTitle>Add New Round</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Round Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Seed Round, Series A"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valuationCap">Valuation Cap ($)</Label>
              <Input
                id="valuationCap"
                type="number"
                value={valuationCap}
                onChange={(e) => setValuationCap(Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetAmount">Target Amount ($)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                min="0"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Round</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/formatters";

interface AddRoundModalProps {
  trigger?: React.ReactNode;
}

export function AddRoundModal({ trigger }: AddRoundModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [valuationCapFormatted, setValuationCapFormatted] = useState("1,000,000");
  const [targetAmountFormatted, setTargetAmountFormatted] = useState("500,000");
  const { addRound } = useCRM();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRound({
      name,
      valuationCap: parseFormattedNumber(valuationCapFormatted),
      targetAmount: parseFormattedNumber(targetAmountFormatted),
    });
    // Reset form
    setName("");
    setValuationCapFormatted("1,000,000");
    setTargetAmountFormatted("500,000");
    setOpen(false);
  };

  const handleValuationCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setValuationCapFormatted(formatNumberWithCommas(numericValue));
  };

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseFormattedNumber(value);
    setTargetAmountFormatted(formatNumberWithCommas(numericValue));
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
            <Button type="submit">Add Round</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

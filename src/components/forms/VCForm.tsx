
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Status } from "@/types";
import { Button } from "@/components/ui/button";
import { VCStatusSelect } from "./VCStatusSelect";
import { PurchaseAmountField } from "./PurchaseAmountField";
import { formatNumberWithCommas } from "@/utils/formatters";

interface VCFormProps {
  onSubmit: (vcData: {
    name: string;
    email?: string;
    website?: string;
    status: Status;
    purchaseAmount?: number;
  }) => void;
  roundId?: string;
}

export function VCForm({ onSubmit, roundId }: VCFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("notContacted");
  const [purchaseAmount, setPurchaseAmount] = useState<number | undefined>(undefined);
  const [purchaseAmountFormatted, setPurchaseAmountFormatted] = useState("");

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    
    // If the value is not empty and doesn't start with a protocol
    if (value && !value.match(/^https?:\/\//)) {
      value = `https://${value}`;
    }
    
    setWebsite(value);
  };

  const handleStatusChange = (value: Status) => {
    setStatus(value);
    if (value === 'finalized' && !purchaseAmount) {
      setPurchaseAmount(0);
      setPurchaseAmountFormatted("0");
    }
  };

  const handlePurchaseAmountChange = (numericValue: number) => {
    setPurchaseAmount(numericValue);
    setPurchaseAmountFormatted(formatNumberWithCommas(numericValue));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      email: email || undefined,
      website: website || undefined,
      status,
      purchaseAmount: status === 'finalized' ? purchaseAmount : undefined,
    });
  };

  // Form validation for required purchase amount with finalized status
  const isFormValid = status !== 'finalized' || 
    (status === 'finalized' && purchaseAmount !== undefined);

  return (
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
            onChange={handleWebsiteChange}
            placeholder="example.com"
          />
        </div>

        <VCStatusSelect 
          status={status}
          onStatusChange={handleStatusChange}
        />
        
        {/* Purchase Amount field that shows only when status is finalized */}
        {status === 'finalized' && (
          <PurchaseAmountField
            value={purchaseAmountFormatted}
            onChange={handlePurchaseAmountChange}
          />
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button type="submit" disabled={!isFormValid}>
          {roundId ? "Add to Round" : "Add VC"}
        </Button>
      </div>
    </form>
  );
}

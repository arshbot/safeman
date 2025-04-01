
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/formatters";

interface PurchaseAmountFieldProps {
  value: string;
  onChange: (value: number) => void;
}

export function PurchaseAmountField({ value, onChange }: PurchaseAmountFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseFormattedNumber(inputValue);
    onChange(numericValue);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="purchaseAmount">
        Purchase Amount ($) <span className="text-red-500">*</span>
      </Label>
      <Input
        id="purchaseAmount"
        value={value}
        onChange={handleChange}
        required
        placeholder="e.g. 100,000"
      />
    </div>
  );
}

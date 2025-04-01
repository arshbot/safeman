
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status } from "@/types";
import { StatusBadge } from "../StatusBadge";
import { Label } from "@/components/ui/label";

interface VCStatusSelectProps {
  status: Status;
  onStatusChange: (value: Status) => void;
}

export function VCStatusSelect({ status, onStatusChange }: VCStatusSelectProps) {
  const statusOptions: Status[] = ['notContacted', 'contacted', 'closeToBuying', 'finalized', 'likelyPassed'];

  return (
    <div className="grid gap-2">
      <Label htmlFor="status">Status</Label>
      <Select
        value={status}
        onValueChange={onStatusChange}
      >
        <SelectTrigger>
          <SelectValue>
            <StatusBadge status={status} className="mr-2" />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((statusOption) => (
            <SelectItem key={statusOption} value={statusOption} className="py-2">
              <div className="flex flex-col space-y-1">
                <StatusBadge status={statusOption} className="mr-2" showDescription={true} />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

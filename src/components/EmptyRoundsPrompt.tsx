
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import { AddRoundModal } from "@/components/AddRoundModal";

export function EmptyRoundsPrompt() {
  return (
    <div className="text-center py-12 bg-secondary/30 rounded-lg border border-dashed border-muted">
      <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No rounds yet</h3>
      <p className="mt-1 text-muted-foreground">
        Create a round to start organizing your VCs
      </p>
      <AddRoundModal
        trigger={
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create First Round
          </Button>
        }
      />
    </div>
  );
}

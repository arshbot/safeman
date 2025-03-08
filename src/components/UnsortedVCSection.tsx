
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddVCModal } from "@/components/AddVCModal";
import { useState } from "react";
import { DroppableVCList } from "./DroppableVCList";
import { VC } from "@/types";

interface UnsortedVCSectionProps {
  vcs: string[];
  getVC: (id: string) => VC | undefined;
}

export function UnsortedVCSection({ vcs, getVC }: UnsortedVCSectionProps) {
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  
  return (
    <div className="mt-8 bg-secondary/50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Unsorted VCs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddVCModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add VC
        </Button>
      </div>

      {vcs.length > 0 ? (
        <DroppableVCList 
          droppableId="unsorted" 
          vcs={vcs} 
          getVC={getVC}
          className="space-y-1"
        />
      ) : (
        <p className="text-center text-muted-foreground p-4">
          No unsorted VCs. All your VCs are organized in rounds!
        </p>
      )}
      
      <AddVCModal
        open={isAddVCModalOpen}
        onOpenChange={setIsAddVCModalOpen}
        roundId={undefined}
      />
    </div>
  );
}

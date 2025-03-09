
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
  const [isHovering, setIsHovering] = useState(false);
  
  console.log(`Rendering UnsortedVCSection with ${vcs.length} VCs`);
  
  return (
    <div 
      className={`mt-8 bg-secondary/50 p-4 rounded-lg border-2 border-dashed 
      ${isHovering ? 'border-primary/80 bg-secondary/80' : 'border-transparent hover:border-secondary'} 
      transition-colors`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      data-section="unsorted-vcs"
    >
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

      <div className="text-xs text-muted-foreground mb-2">
        Drag VCs here to move them to the unsorted section
      </div>

      {vcs.length > 0 ? (
        <DroppableVCList 
          droppableId="unsorted" 
          vcs={vcs} 
          getVC={getVC}
          className="border border-dashed border-secondary/50 rounded-lg p-2 min-h-[80px]"
        />
      ) : (
        <div className="text-center text-muted-foreground p-4 border border-dashed border-secondary/50 rounded-lg min-h-[80px]">
          <p>No unsorted VCs. All your VCs are organized in rounds!</p>
          <p className="text-xs mt-2">Drop a VC here to move it from a round</p>
        </div>
      )}
      
      <AddVCModal
        open={isAddVCModalOpen}
        onOpenChange={setIsAddVCModalOpen}
        roundId={undefined}
      />
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddVCModal } from "@/components/AddVCModal";
import { useState, useEffect } from "react";
import { DroppableVCList } from "./DroppableVCList";
import { VC } from "@/types";

interface UnsortedVCSectionProps {
  vcs: string[];
  getVC: (id: string) => VC | undefined;
}

export function UnsortedVCSection({ vcs, getVC }: UnsortedVCSectionProps) {
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  console.log(`[DEBUG] Rendering UnsortedVCSection with ${vcs.length} VCs`);
  
  // Setup event listeners to track when items are dragging over this section
  useEffect(() => {
    const handleDragEnterUnsorted = (e: Event) => {
      const target = e.target as HTMLElement;
      // Check if we're dragging over the unsorted droppable or any of its children
      if (target.closest('[data-droppable-id="unsorted"]')) {
        console.log("[DEBUG] Drag entered unsorted section");
        setIsDraggingOver(true);
      }
    };
    
    const handleDragLeaveUnsorted = (e: Event) => {
      const target = e.target as HTMLElement;
      // Only set to false if we're leaving the entire unsorted area
      if (!target.closest('[data-droppable-id="unsorted"]')) {
        console.log("[DEBUG] Drag left unsorted section");
        setIsDraggingOver(false);
      }
    };
    
    const handleDragEndUnsorted = () => {
      console.log("[DEBUG] Drag ended, resetting unsorted section state");
      setIsDraggingOver(false);
    };
    
    document.addEventListener('dragenter', handleDragEnterUnsorted);
    document.addEventListener('dragleave', handleDragLeaveUnsorted);
    document.addEventListener('dragend', handleDragEndUnsorted);
    
    return () => {
      document.removeEventListener('dragenter', handleDragEnterUnsorted);
      document.removeEventListener('dragleave', handleDragLeaveUnsorted);
      document.removeEventListener('dragend', handleDragEndUnsorted);
    };
  }, []);
  
  return (
    <div 
      className={`mt-8 bg-secondary/50 p-4 rounded-lg border-2 border-dashed 
      ${isDraggingOver 
        ? 'border-primary bg-primary/10' 
        : isHovering 
          ? 'border-primary/80 bg-secondary/80' 
          : 'border-transparent hover:border-secondary'
      } 
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
          className={`
            border border-dashed rounded-lg p-2 min-h-[120px]
            ${isDraggingOver 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-secondary/50'
            }
          `}
        />
      ) : (
        <div 
          className={`
            text-center text-muted-foreground p-4 
            border border-dashed rounded-lg min-h-[120px] 
            ${isDraggingOver 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-secondary/50'
            }
          `}
          data-droppable-id="unsorted-empty"
        >
          <p>No unsorted VCs. All your VCs are organized in rounds!</p>
          <p className="text-xs mt-2">Drop a VC here to move it from a round</p>
          {isDraggingOver && (
            <div className="mt-4 py-2 px-4 bg-primary/10 text-primary font-medium rounded-md inline-block">
              Drop here to add to unsorted
            </div>
          )}
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

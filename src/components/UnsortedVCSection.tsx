
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddVCModal } from "@/components/AddVCModal";
import { useState } from "react";
import { DroppableVCList } from "./DroppableVCList";
import { VC } from "@/types";
import { Droppable } from "react-beautiful-dnd";

interface UnsortedVCSectionProps {
  vcs: string[];
  getVC: (id: string) => VC | undefined;
}

export function UnsortedVCSection({ vcs, getVC }: UnsortedVCSectionProps) {
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  
  console.log(`[DEBUG] Rendering UnsortedVCSection with ${vcs.length} VCs`, vcs);
  
  return (
    <div 
      className="mt-8 bg-[#F1F5F980] p-4 rounded-lg border-2 border-dashed border-transparent hover:border-secondary transition-colors"
      data-section="unsorted-vcs"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Unsorted VCs</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddVCModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add VC
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        Drag VCs here to move them to the unsorted section
      </div>

      {/* Use a direct Droppable for the unsorted section */}
      <Droppable droppableId="unsorted" type="VC">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              border border-dashed rounded-lg p-3 min-h-[150px]
              ${snapshot.isDraggingOver 
                ? 'border-primary bg-primary/10 shadow-md' 
                : 'border-secondary/50'
              }
              transition-colors duration-200
            `}
            data-droppable-id="unsorted"
            data-is-dragging-over={snapshot.isDraggingOver}
          >
            {vcs.length > 0 ? (
              <DroppableVCList 
                key="inner-unsorted-list"
                droppableId="unsorted" 
                vcs={vcs} 
                getVC={getVC}
                enableDropping={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <p>No unsorted VCs. All your VCs are organized in rounds!</p>
                <p className="text-xs mt-2">Drop a VC here to move it from a round</p>
                {snapshot.isDraggingOver && (
                  <div className="mt-4 py-2 px-4 bg-primary/10 text-primary font-medium rounded-md inline-block">
                    Drop here to add to unsorted
                  </div>
                )}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      
      <AddVCModal
        open={isAddVCModalOpen}
        onOpenChange={setIsAddVCModalOpen}
        roundId={undefined}
      />
    </div>
  );
}

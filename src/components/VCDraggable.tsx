
import { VC } from "@/types";
import { Draggable } from "react-beautiful-dnd";
import { VCRow } from "./VCRow";

interface VCDraggableProps {
  vcId: string;
  index: number;
  vc: VC;
  roundId?: string;
}

export function VCDraggable({ vcId, index, vc, roundId }: VCDraggableProps) {
  // Generate a consistent draggableId that works both for round VCs and unsorted VCs
  // The format is: either "round-{roundId}-{vcId}" or "unsorted-{vcId}"
  const draggableId = roundId 
    ? `round-${roundId}-${vcId}` 
    : `unsorted-${vcId}`;
  
  console.log(`Rendering draggable: ${draggableId}, in container: ${roundId || 'unsorted'}`);
    
  return (
    <Draggable 
      draggableId={draggableId} 
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? 'opacity-70' : 'opacity-100'} transition-opacity`}
        >
          <VCRow 
            vc={vc} 
            roundId={roundId}
          />
        </div>
      )}
    </Draggable>
  );
}

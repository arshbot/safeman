
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
    
  return (
    <Draggable 
      key={vcId} 
      draggableId={draggableId} 
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
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
